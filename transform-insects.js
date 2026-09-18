const fs = require('fs');
const path = require('path');

// Read the new data file (user needs to save the JSON they pasted)
const newDataPath = path.join(__dirname, 'new-insects-data.json');
if (!fs.existsSync(newDataPath)) {
  console.error('ERROR: Save the new JSON data to new-insects-data.json first!');
  console.error('Run: cat > new-insects-data.json and paste the JSON, then Ctrl+D');
  process.exit(1);
}

const newData = JSON.parse(fs.readFileSync(newDataPath, 'utf-8'));

// Transform orders[] array to key-based format
const result = {};
const orders = newData.orders || [];

orders.forEach(order => {
  const key = order.order_en;
  result[key] = {
    order_ar: order.order_ar,
    order_en: order.order_en,
    order_description: order.order_description,
    families_count: order.families_count,
    pathogens_count: order.pathogens_count,
    pathogens: order.pathogens || []
  };
});

// Write to data.json
const outPath = path.join(__dirname, 'src/knowledge_base/insects/insects-folder/data.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

console.log('Orders:', Object.keys(result).join(', '));
Object.entries(result).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.pathogens_count} pathogens (${v.pathogens.length} actual)`);
});
console.log('Total species:', orders.reduce((sum, o) => sum + (o.pathogens?.length || 0), 0));
