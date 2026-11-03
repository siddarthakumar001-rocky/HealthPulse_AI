const fs = require('fs');

// 1. Update src/components/ui/tabs.tsx
let tabsContent = fs.readFileSync('src/components/ui/tabs.tsx', 'utf8');
tabsContent = tabsContent.replace(
  '"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"',
  '"inline-flex h-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-border p-1 text-muted-foreground shadow-inner"'
);
tabsContent = tabsContent.replace(
  '"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"',
  '"inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider ring-offset-background transition-all duration-300 data-[state=active]:bg-teal-600 dark:data-[state=active]:bg-teal-400 data-[state=active]:text-white dark:data-[state=active]:text-slate-950 data-[state=active]:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"'
);
fs.writeFileSync('src/components/ui/tabs.tsx', tabsContent, 'utf8');

// 2. Update Profile.tsx
let profContent = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
profContent = profContent.replace(
  'rounded-xl h-12 shadow-inner',
  'rounded-full h-12 shadow-inner'
);
profContent = profContent.replaceAll(
  'rounded-xl data-[state=active]:bg-teal-600',
  'rounded-full data-[state=active]:bg-teal-600'
);
fs.writeFileSync('src/pages/Profile.tsx', profContent, 'utf8');

// 3. Update ReportUpload.tsx
let reportContent = fs.readFileSync('src/pages/ReportUpload.tsx', 'utf8');
reportContent = reportContent.replace(
  'p-1 rounded-xl shadow-inner',
  'p-1 rounded-full shadow-inner'
);
reportContent = reportContent.replace(
  'rounded-2xl h-12',
  'rounded-full h-12'
);
reportContent = reportContent.replaceAll(
  'className="rounded-xl data-[state=active]:bg-',
  'className="rounded-full data-[state=active]:bg-'
);
reportContent = reportContent.replaceAll(
  'flex items-center gap-2 rounded-lg font-mono text-xs',
  'flex items-center gap-2 rounded-full font-mono text-xs'
);
fs.writeFileSync('src/pages/ReportUpload.tsx', reportContent, 'utf8');

console.log('UI tabs and page tab pills updated successfully!');

