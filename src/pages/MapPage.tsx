import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigation, Hospital, Search, List, X, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconSize: [30, 48], iconAnchor: [15, 48],
  className: "hue-rotate-[140deg] drop-shadow-lg",
});

interface HospitalMarker { id: number; name: string; type: string; lat: number; lon: number; distance?: number; }

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function LocationMarker({ onLocationFound }: { onLocationFound: (lat: number, lon: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const onLocFound = (e: L.LocationEvent) => {
      console.log("[Map] Map-based location found:", e.latlng.lat, e.latlng.lng);
      onLocationFound(e.latlng.lat, e.latlng.lng);
    };

    map.on("locationfound", onLocFound);
    return () => { map.off("locationfound", onLocFound); };
  }, [map, onLocationFound]);
  return null;
}

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

function MapBounds({ hospitals, position }: { hospitals: HospitalMarker[], position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (hospitals.length > 0) {
      const bounds = L.latLngBounds([position, ...hospitals.map(h => [h.lat, h.lon] as [number, number])]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [hospitals, position, map]);
  return null;
}

export default function MapPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<HospitalMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius] = useState(10);
  const [hasFetched, setHasFetched] = useState(false);

  // Initialize Geolocation on Mount
  useEffect(() => {
    console.log("Initializing User Location Scan...");
    const fallback: [number, number] = [12.9716, 77.5946]; // Bangalore

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser.");
      setPosition(fallback);
      setLocating(false);
      toast({ title: "Location unsupported", description: "Showing hospitals from default area." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("User Location Captured:", latitude, longitude);
        setPosition([latitude, longitude]);
        setLocating(false);
      },
      (err) => {
        console.warn("Location permission denied or failed:", err.message);
        setPosition(fallback);
        setLocating(false);
        toast({ 
          title: "Location Permission Required", 
          description: "Showing nearby hospitals from default area (Bangalore).",
          variant: "destructive" 
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [toast]);

  const fetchHospitals = useCallback(async (lat: number, lon: number, radius = 10000, force = false) => {
    const cacheKey = `hospitals_${lat.toFixed(3)}_${lon.toFixed(3)}_${radius}`;
    const cached = localStorage.getItem(cacheKey);
    if (!force && cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 1000 * 60 * 60 * 24) {
        setHospitals(data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    const servers = [
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ];

    const query = `[out:json][timeout:25];(nwr["amenity"~"hospital|clinic|pharmacy|doctors|medical|dentist|health_post|dispensary|nursing_home"](around:${radius},${lat},${lon});nwr["healthcare"](around:${radius},${lat},${lon}););out center body 50;`;
    
    // Parallel Race Strategy: Query all mirrors and take the first successful response
    const fetchWithTimeout = async (url: string) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(`${url}?data=${encodeURIComponent(query)}`, { signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error("Server rejected request");
        return await res.json();
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    try {
      const data = await Promise.any(servers.map(s => fetchWithTimeout(s)));
      
      if (!data.elements || data.elements.length === 0) {
        setHospitals([]);
        setError(`No medical facilities found within 10km.`);
        setLoading(false);
        return;
      }

      const results: HospitalMarker[] = data.elements.map((el: any) => {
        const hLat = el.lat || el.center?.lat;
        const hLon = el.lon || el.center?.lon;
        const tags = el.tags || {};
        return {
          id: el.id, 
          name: tags.name || tags["name:en"] || tags["name:kn"] || "Medical Center", 
          type: tags.amenity || tags.healthcare || "Facility",
          lat: hLat, lon: hLon,
          distance: calculateDistance(lat, lon, hLat, hLon)
        };
      }).filter((h: any) => h.lat && h.lon)
        .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));

      setHospitals(results);
      localStorage.setItem(cacheKey, JSON.stringify({ data: results, timestamp: Date.now() }));
    } catch (err: any) {
      console.error("[Map] All mirrors failed or timed out", err);
      setError("Discovery systems are slow. Retrying...");
      setTimeout(() => fetchHospitals(lat, lon, radius, true), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationFound = useCallback((lat: number, lon: number) => {
    setPosition([lat, lon]); 
  }, []);

  // Auto-fetch when position is available - Runs only once
  useEffect(() => {
    if (position && hospitals.length === 0 && !loading && !locating && !hasFetched) {
      console.log("User Location Triggered Fetch:", position);
      fetchHospitals(position[0], position[1]);
      setHasFetched(true);
    }
  }, [position, hospitals.length, loading, locating, fetchHospitals, hasFetched]);



  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
              {t("map.title")}
            </h1>
            <p className="font-mono text-xs text-cyan-700 dark:text-cyan-500/60 uppercase tracking-widest mt-1 font-bold">
              {t("map.subtitle")}
            </p>
          </motion.div>
        </div>

        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl overflow-hidden border border-cyan-500/20 dark:border-cyan-500/15 shadow-[0_0_30px_rgba(0,243,255,0.06)]"
        >
          <div className="h-[350px] md:h-[500px] lg:h-[600px] w-full relative" style={{ zIndex: 0 }}>
            {(loading || locating) && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent animate-spin"
                      style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                  </div>
                  <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-widest animate-pulse max-w-[200px]">
                    {locating ? "Establishing Biometric Location..." : `Scanning Medical Database (${searchRadius}km)...`}
                  </p>
                </div>
              </div>
            )}



            <MapContainer center={position || [12.9716, 77.5946]} zoom={13} className="h-full w-full" scrollWheelZoom>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker onLocationFound={handleLocationFound} />
              <MapController center={position} />
              {position && <MapBounds hospitals={hospitals} position={position} />}
              {position && <Marker position={position}><Popup>Current Location</Popup></Marker>}
              {hospitals.map((h) => (
                <Marker key={h.id} position={[h.lat, h.lon]} icon={hospitalIcon}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-sm text-foreground">{h.name}</p>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-bold text-cyan-600 hover:underline inline-block mt-1">
                        {t("map.navigate")}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* Hospital list */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-mono text-xs text-cyan-700 dark:text-cyan-500/60 uppercase tracking-widest font-bold">
              Discovered Facilities ({hospitals.length})
            </h2>
            {hospitals.length > 0 && (
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase animate-pulse">Live Feed Active</span>
            )}
          </div>
          {hospitals.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="liquid-glass flex items-center gap-4 p-4 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                <Hospital className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-foreground leading-tight truncate">{h.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-black">{h.distance?.toFixed(1)} KM AWAY</p>
                  {i === 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-[8px] font-bold uppercase tracking-widest animate-pulse">
                      Closest Facility
                    </span>
                  )}
                  {h.distance && h.distance <= 5 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[8px] font-bold uppercase tracking-widest">
                      Nearby
                    </span>
                  )}
                </div>
              </div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                  className="h-10 w-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                </motion.button>
              </a>
            </motion.div>
          ))}
          {!loading && hospitals.length === 0 && (
            <div className="py-12 text-center rounded-2xl border border-dashed border-cyan-500/20 bg-muted/10">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{t("map.noFacilities")}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
