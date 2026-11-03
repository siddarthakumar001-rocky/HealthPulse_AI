const fs = require('fs');

let content = fs.readFileSync('src/pages/PHCCommandDashboard.tsx', 'utf8');

// 1. MapHelper safe coordinates
const oldMapHelper = `// Auto-Center Map Helper
function MapHelper({ facilities }: { facilities: PHCFacility[] }) {
  const map = useMap();
  useEffect(() => {
    if (facilities.length > 0) {
      const bounds = L.latLngBounds(facilities.map((f) => [f.latitude, f.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [facilities, map]);
  return null;
}`;

const newMapHelper = `// Auto-Center Map Helper
function MapHelper({ facilities }: { facilities: PHCFacility[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = (facilities || []).filter(
      (f) => typeof f?.latitude === "number" && !isNaN(f.latitude) && typeof f?.longitude === "number" && !isNaN(f.longitude)
    );
    if (valid.length > 0) {
      try {
        const bounds = L.latLngBounds(valid.map((f) => [f.latitude, f.longitude]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
      } catch (err) {
        console.warn("MapHelper bounds error:", err);
      }
    }
  }, [facilities, map]);
  return null;
}`;

// 2. MapViewController safe coordinates
const oldMapViewController = `// Controller to smoothly pan to center coordinates
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}`;

const newMapViewController = `// Controller to smoothly pan to center coordinates
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      try {
        map.flyTo(center, zoom, { duration: 1.2 });
      } catch (err) {
        console.warn("MapViewController flyTo error:", err);
      }
    }
  }, [center, zoom, map]);
  return null;
}`;

// 3. Status filter tabs sliding pill
const oldStatusTabs = `                  <div className="flex items-center gap-1 bg-card/80 p-1 rounded-2xl border border-border">
                    {["ALL", "OPTIMAL", "WARNING", "OUTBREAK"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={\`px-2.5 py-1 rounded-xl transition text-[10px] font-extrabold \${
                          statusFilter === st
                            ? "bg-[#0D9488] text-slate-950 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }\`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>`;

const newStatusTabs = `                  <div className="relative inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-border shadow-inner">
                    {["ALL", "OPTIMAL", "WARNING", "OUTBREAK"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={\`relative z-10 px-3 py-1 rounded-full transition-colors text-[10px] font-mono font-extrabold tracking-wider uppercase select-none \${
                          statusFilter === st
                            ? "text-white dark:text-slate-950 font-black"
                            : "text-muted-foreground hover:text-foreground"
                        }\`}
                      >
                        {statusFilter === st && (
                          <motion.div
                            layoutId="phc-status-pill"
                            className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{st}</span>
                      </button>
                    ))}
                  </div>`;

// 4. Marker position filtering
const oldMarkers = `                  {/* PHC Facilities Markers */}
                  {filteredFacilities.map((facility) => (`;

const newMarkers = `                  {/* PHC Facilities Markers */}
                  {filteredFacilities
                    .filter((facility) => Number.isFinite(facility?.latitude) && Number.isFinite(facility?.longitude))
                    .map((facility) => (`;

function replaceNormalized(src, oldText, newText) {
  const normSrc = src.replace(/\r\n/g, '\n');
  const normOld = oldText.replace(/\r\n/g, '\n');
  const normNew = newText.replace(/\r\n/g, '\n');
  return normSrc.replace(normOld, normNew);
}

content = replaceNormalized(content, oldMapHelper, newMapHelper);
content = replaceNormalized(content, oldMapViewController, newMapViewController);
content = replaceNormalized(content, oldStatusTabs, newStatusTabs);
content = replaceNormalized(content, oldMarkers, newMarkers);

fs.writeFileSync('src/pages/PHCCommandDashboard.tsx', content, 'utf8');
console.log('PHCCommandDashboard updated successfully!');

