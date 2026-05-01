import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Navigation, Hospital, Search, List, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
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

interface HospitalMarker { id: number; name: string; type: string; lat: number; lon: number; }

function LocationMarker({ onLocationFound }: { onLocationFound: (lat: number, lon: number) => void }) {
  const map = useMap();
  useEffect(() => {
    let locating = false;
    map.locate({ setView: true, maxZoom: 15 });
    const onLocFound = (e: L.LocationEvent) => {
      if (!locating) { onLocationFound(e.latlng.lat, e.latlng.lng); locating = true; }
    };
    map.on("locationfound", onLocFound);
    return () => { map.off("locationfound", onLocFound); };
  }, [map, onLocationFound]);
  return null;
}

export default function MapPage() {
  const { t } = useTranslation();
  const [position, setPosition] = useState<[number, number]>([20.5937, 78.9629]);
  const [hospitals, setHospitals] = useState<HospitalMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(false);

  const fetchHospitals = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const query = `[out:json][timeout:15];nwr["amenity"~"hospital|clinic"](around:10000,${lat},${lon});out center body 40;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Overpass API error");
      const data = await res.json();
      const results: HospitalMarker[] = data.elements.map((el: any) => ({
        id: el.id, name: el.tags?.name || "Medical Center", type: el.tags?.amenity || "Facility",
        lat: el.lat || el.center?.lat, lon: el.lon || el.center?.lon,
      })).filter((h: any) => h.lat && h.lon);
      setHospitals(results);
    } catch (err) { console.error("Failed to fetch hospitals", err); }
    setLoading(false);
  }, []);

  const handleLocationFound = useCallback((lat: number, lon: number) => {
    setPosition([lat, lon]); fetchHospitals(lat, lon);
  }, [fetchHospitals]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        handleLocationFound(parseFloat(lat), parseFloat(lon));
      }
    } catch (err) { console.error("Geocoding failed", err); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
            {t("map.title")}
          </h1>
          <p className="font-mono text-xs text-cyan-700 dark:text-cyan-500/60 uppercase tracking-widest mt-1 font-bold">
            {t("map.subtitle")}
          </p>
        </motion.div>

        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl overflow-hidden border border-cyan-500/20 dark:border-cyan-500/15 shadow-[0_0_30px_rgba(0,243,255,0.06)]"
        >
          <div className="h-[500px] w-full relative" style={{ zIndex: 0 }}>
            {loading && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent animate-spin"
                      style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                  </div>
                  <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-widest animate-pulse">
                    {t("map.locating")}
                  </p>
                </div>
              </div>
            )}

            {/* Floating glass panel */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none" style={{ maxWidth: "90%" }}>
              <div className="pointer-events-auto w-72 sm:w-80 rounded-xl p-3 space-y-2 bg-background/80 dark:bg-black/70 backdrop-blur-xl border border-cyan-500/20 shadow-lg">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("map.searchPlaceholder")}
                    className="h-9 rounded-lg text-sm font-mono bg-background/60 border-cyan-500/20"
                  />
                  <Button type="submit" size="icon"
                    className="h-9 w-9 shrink-0 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
                <button
                  onClick={() => setShowList(!showList)}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-mono font-bold py-1.5 rounded-lg uppercase tracking-wider text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  {showList ? <X className="h-3 w-3" /> : <List className="h-3 w-3" />}
                  {showList ? t("map.hideList") : t("map.showList")} ({hospitals.length})
                </button>
                {showList && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {hospitals.length === 0 && !loading && (
                      <p className="text-[10px] text-center font-mono text-muted-foreground py-2">{t("map.noFacilities")}</p>
                    )}
                    {hospitals.map((h) => (
                      <div key={h.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                        <Hospital className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="text-[10px] font-mono text-foreground/80 truncate flex-1">{h.name}</span>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[9px] font-bold font-mono text-cyan-600 dark:text-cyan-400 hover:underline shrink-0">
                          {t("map.navigate")}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <MapContainer center={position} zoom={13} className="h-full w-full" scrollWheelZoom>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker onLocationFound={handleLocationFound} />
              <Marker position={position}><Popup>Current Location</Popup></Marker>
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

        {/* Hospital list (desktop) */}
        <div className="hidden md:block space-y-3">
          {hospitals.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="liquid-glass flex items-center gap-4 p-4 rounded-2xl"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                <Hospital className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-foreground leading-tight">{h.name}</p>
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
