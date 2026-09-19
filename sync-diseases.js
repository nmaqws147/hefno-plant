#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'src/disease-folder/all_diseases.jsx');
const outDir = path.join(__dirname, 'src/disease-folder');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const groupMap = [
  // Fungi sub-classes → fungi.json (all 4 fungal classes combined)
  { groups: ['Oomycota', 'Zygomycota', 'Ascomycota', 'Basidiomycota'], file: 'fungi.json', merge: true },
  // Individual categories
  { groups: ['Bacterial Diseases'], file: 'bacteria.json' },
  { groups: ['Viral Diseases'], file: 'viruses.json' },
  { groups: ['Nematode Diseases'], file: 'nema.json' },
  { groups: ['Physiological Disorders'], file: 'pysh.json', key: 'disorders' },
  { groups: ['Parasitic Plants'], file: 'para.json' },
  // New groups
  { groups: ['Critical Additions — High Priority Pathogens'], file: 'critical.json' },
  { groups: ['Plasmodiophoromycota & Chytridiomycota'], file: 'plasmo.json' },
  { groups: ['Final Additions — Remaining Pathogens'], file: 'final.json' },
];

for (const mapping of groupMap) {
  const matchedGroups = master.groups.filter(g => mapping.groups.includes(g.group_name_en));
  
  if (matchedGroups.length === 0) {
    console.error(`WARNING: No groups found for: ${mapping.groups.join(', ')}`);
    continue;
  }

  let output;
  if (mapping.merge) {
    // Merge multiple groups into one file (for fungi sub-classes)
    output = {
      database: master.database,
      groups: matchedGroups.map(g => ({
        group_id: g.group_id,
        group_name_ar: g.group_name_ar,
        group_name_en: g.group_name_en,
        description_ar: g.description_ar,
        item_type: g.item_type,
        count: g.count,
        pathogens: g.pathogens || []
      }))
    };
  } else {
    // Single group per file
    const g = matchedGroups[0];
    const items = g.pathogens || g.disorders || [];
    output = {
      database: master.database,
      groups: [{
        group_id: g.group_id,
        group_name_ar: g.group_name_ar,
        group_name_en: g.group_name_en,
        description_ar: g.description_ar,
        item_type: g.item_type,
        count: g.count,
        [mapping.key || 'pathogens']: items
      }]
    };
  }

  const outPath = path.join(outDir, mapping.file);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  const totalItems = (output.groups || []).reduce((s, g) => s + (g.pathogens || g.disorders || []).length, 0);
  console.log(`✓ ${mapping.file} — ${matchedGroups.length} group(s), ${totalItems} items`);
}

console.log('\nDone!');
