import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'content-contract.json'), 'utf8'));
const failures = [];

for (const [id, phrases] of Object.entries(contract.sections)) {
  const start = html.indexOf(`<section id="${id}"`);
  const end = start < 0 ? -1 : html.indexOf('</section>', start);
  const section = start < 0 || end < 0 ? '' : html.slice(start, end);
  if (!section) failures.push(`${id}: section missing`);
  for (const phrase of phrases) if (!section.includes(phrase)) failures.push(`${id}: missing “${phrase}”`);
}

for (const phrase of contract.appPhrases) if (!app.includes(phrase)) failures.push(`app.js: missing “${phrase}”`);
for (const file of contract.requiredFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`file missing: ${file}`);

if (failures.length) {
  console.error(`CONTENT CONTRACT FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`CONTENT CONTRACT PASSED: ${Object.keys(contract.sections).length} modules, ${contract.appPhrases.length} interactive copy checks, ${contract.requiredFiles.length} asset checks.`);
