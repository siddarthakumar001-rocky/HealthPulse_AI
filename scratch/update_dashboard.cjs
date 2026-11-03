const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldBlock = `            {/* IEEE Paper Mode Switcher: Animated Symmetrical Sliding Segmented Control */}
            <div className="relative inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setMonitoringMode("live")}
                className={\`relative z-10 flex items-center justify-center gap-1.5 px-4 py-1.5 min-w-[136px] sm:min-w-[146px] h-8 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 \${
                  monitoringMode === "live"
                    ? "text-white dark:text-slate-950"
                    : "text-muted-foreground hover:text-foreground"
                }\`}
              >
                {monitoringMode === "live" && (
                  <motion.div
                    layoutId="active-monitoring-pill"
                    className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Radio className="h-3 w-3" />
                  LIVE MONITORING
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMonitoringMode("research")}
                className={\`relative z-10 flex items-center justify-center gap-1.5 px-4 py-1.5 min-w-[136px] sm:min-w-[146px] h-8 rounded-full font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 \${
                  monitoringMode === "research"
                    ? "text-white dark:text-slate-950"
                    : "text-muted-foreground hover:text-foreground"
                }\`}
              >
                {monitoringMode === "research" && (
                  <motion.div
                    layoutId="active-monitoring-pill"
                    className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <FlaskConical className="h-3 w-3" />
                  RESEARCH DEMO
                </span>
              </button>
            </div>`;

const newBlock = `            {/* IEEE Paper Mode Switcher: Animated Symmetrical Sliding Segmented Control */}
            <div className="relative inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setMonitoringMode("live")}
                className={\`relative z-10 flex items-center justify-center gap-2 w-[148px] h-9 rounded-full font-mono text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 select-none \${
                  monitoringMode === "live"
                    ? "text-white dark:text-slate-950"
                    : "text-muted-foreground hover:text-foreground"
                }\`}
              >
                {monitoringMode === "live" && (
                  <motion.div
                    layoutId="active-monitoring-pill"
                    className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-md"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 shrink-0" />
                  <span>LIVE MONITORING</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMonitoringMode("research")}
                className={\`relative z-10 flex items-center justify-center gap-2 w-[148px] h-9 rounded-full font-mono text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 select-none \${
                  monitoringMode === "research"
                    ? "text-white dark:text-slate-950"
                    : "text-muted-foreground hover:text-foreground"
                }\`}
              >
                {monitoringMode === "research" && (
                  <motion.div
                    layoutId="active-monitoring-pill"
                    className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-md"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                  <span>RESEARCH DEMO</span>
                </span>
              </button>
            </div>`;

function replaceNormalized(src, oldText, newText) {
  const normSrc = src.replace(/\r\n/g, '\n');
  const normOld = oldText.replace(/\r\n/g, '\n');
  const normNew = newText.replace(/\r\n/g, '\n');
  return normSrc.replace(normOld, normNew);
}

content = replaceNormalized(content, oldBlock, newBlock);
fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
console.log('Dashboard mode switcher updated successfully!');

