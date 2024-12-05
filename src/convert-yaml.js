const fs = require('node:fs');
const yaml = require('js-yaml');

// Convert YAML to JSON
const yamlFile = fs.readFileSync('src/scenarios.yaml', 'utf8');
const jsonData = yaml.load(yamlFile);

// Write JSON to a file
fs.writeFileSync('src/scenarios.json', JSON.stringify(jsonData, null, 2));