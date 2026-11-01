import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = p => readFileSync(resolve(root, p), 'utf8');
const template = read('templates/case.html');
// A case owns its narrative, visuals and interactions; the shared template owns the page shell.
const cases = [{ slug: 'e57', title: 'Персонализированная презентация проекта отделки — кейс E57', description: 'От запроса заказчика через данные объекта к персональному предложению по отделке.' }];
for (const item of cases) {
  const dir = `case-sources/${item.slug}`;
  const values = { ...item, styles: read(`${dir}/styles.css`), content: read(`${dir}/content.html`), interactions: read(`${dir}/interactions.js`) };
  const html = template.replace(/\{\{(title|description|styles|content|interactions)\}\}/g, (_, key) => values[key]);
  writeFileSync(resolve(root, `cases/${item.slug}/index.html`), html);
}
