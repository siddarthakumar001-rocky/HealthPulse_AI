const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../backend/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('ROUTE AUDIT:');
files.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  console.log(`\n=== FILE: ${file} ===`);
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('router.') || trimmed.startsWith('app.')) {
      console.log(`  Line ${idx + 1}: ${trimmed.slice(0, 100)}`);
    }
  });
});
