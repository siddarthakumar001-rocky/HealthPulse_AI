const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const dir = 'dist/assets';
const files = fs.readdirSync(dir);
console.log('CHUNKS IN dist/assets:');
files.forEach(f => {
  const p = path.join(dir, f);
  const buf = fs.readFileSync(p);
  const gz = zlib.gzipSync(buf);
  console.log(`${f}: raw = ${(buf.length / 1024).toFixed(2)} KB, gzip = ${(gz.length / 1024).toFixed(2)} KB`);
});
