#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, 'new-insects-data.json');

process.stdin.setEncoding('utf8');
let data = '';

process.stdin.on('data', (chunk) => {
  data += chunk;
});

process.stdin.on('end', () => {
  try {
    JSON.parse(data);
    fs.writeFileSync(outPath, data, 'utf8');
    console.log(`SUCCESS: Saved ${data.length} bytes to new-insects-data.json`);
  } catch (e) {
    console.error(`ERROR: Invalid JSON — ${e.message}`);
    process.exit(1);
  }
});
