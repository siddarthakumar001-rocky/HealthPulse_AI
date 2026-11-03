const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Header back button and title
const oldHeader = `          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <h1 className="text-xl font-bold font-display neon-text-cyan">SYS_ADMIN</h1>
            </div>
          </div>`;

const newHeader = `          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-all shadow-sm"
              title="Return to Public Portal"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>PORTAL</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h1 className="text-lg font-bold font-display tracking-wider text-foreground">SYS_ADMIN</h1>
            </div>
          </div>`;

// 2. Main tabs sliding pill
const oldTabs = `        <div className="flex justify-center mb-8">
          <div className="inline-flex glass-panel rounded-full p-1 border-border">
            {['analytics', 'funnel', 'users', 'feedbacks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={\`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 \${
                  activeTab === tab 
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }\`}
              >
                {tab === 'funnel' ? 'Funnel & Focus' : tab}
              </button>
            ))}
          </div>
        </div>`;

const newTabs = `        <div className="flex justify-center mb-8">
          <div className="relative inline-flex items-center p-1.5 rounded-full bg-card/90 border border-border shadow-md">
            {(['analytics', 'funnel', 'users', 'feedbacks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={\`relative z-10 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-200 \${
                  activeTab === tab 
                    ? 'text-white dark:text-slate-950 font-black' 
                    : 'text-muted-foreground hover:text-foreground'
                }\`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-admin-tab-pill"
                    className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{tab === 'funnel' ? 'Funnel & Focus' : tab}</span>
              </button>
            ))}
          </div>
        </div>`;

// 3. Code tabs sliding pill
const oldCodeTabs = `                      <div className="inline-flex glass-panel rounded-lg p-0.5 border-border">
                        {(['sql', 'python', 'javascript'] as const).map(ct => (
                          <button
                            key={ct}
                            onClick={() => setSelectedCodeTab(ct)}
                            className={\`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all \${
                              selectedCodeTab === ct 
                                ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                                : 'text-muted-foreground hover:text-foreground'
                            }\`}
                          >
                            {ct.toUpperCase()}
                          </button>
                        ))}
                      </div>`;

const newCodeTabs = `                      <div className="relative inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-border shadow-inner">
                        {(['sql', 'python', 'javascript'] as const).map(ct => (
                          <button
                            key={ct}
                            onClick={() => setSelectedCodeTab(ct)}
                            className={\`relative z-10 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors \${
                              selectedCodeTab === ct 
                                ? 'text-white dark:text-slate-950 font-bold' 
                                : 'text-muted-foreground hover:text-foreground'
                            }\`}
                          >
                            {selectedCodeTab === ct && (
                              <motion.div
                                layoutId="active-code-pill"
                                className="absolute inset-0 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{ct.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>`;

// 4. Feedback hero ratings styling
const oldFeedHero1 = `md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-black/40 border border-amber-500/20 text-center`;
const newFeedHero1 = `md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border text-center shadow-sm`;

const oldFeedHero2 = `p-4 rounded-xl bg-black/40 border border-border text-center`;
const newFeedHero2 = `p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border text-center shadow-sm`;

// Replace helpers
function replaceNormalized(src, oldText, newText) {
  const normSrc = src.replace(/\r\n/g, '\n');
  const normOld = oldText.replace(/\r\n/g, '\n');
  const normNew = newText.replace(/\r\n/g, '\n');
  if (!normSrc.includes(normOld)) {
    console.warn("NOT FOUND:", normOld.slice(0, 40));
    return src;
  }
  return normSrc.replace(normOld, normNew);
}

content = replaceNormalized(content, oldHeader, newHeader);
content = replaceNormalized(content, oldTabs, newTabs);
content = replaceNormalized(content, oldCodeTabs, newCodeTabs);
content = content.replaceAll(oldFeedHero1, newFeedHero1);
content = content.replaceAll(oldFeedHero2, newFeedHero2);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content, 'utf8');
console.log('AdminDashboard updated successfully!');

