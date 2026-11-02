import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = p => readFileSync(resolve(root, p), 'utf8');
// A case owns its narrative, visuals and interactions; the shared template owns the page shell.
const cases = [
  { slug: 'e57', title: 'Персонализированная презентация проекта отделки', description: 'От запроса заказчика через данные объекта к персональному предложению по отделке.', content: 'content.html', interactions: 'interactions.js', template: 'templates/case.html', output: 'cases/e57/index.html' },
  { slug: 'e57', title: 'A tailored presentation for a fit-out project', description: 'Turning apartment scan data into a clear proposal for fit-out work.', content: 'content.en.html', interactions: 'interactions.en.js', template: 'templates/case-en.html', output: 'en/cases/e57/index.html' },
];
for (const item of cases) {
  const dir = `case-sources/${item.slug}`;
  const values = { ...item, styles: read(`${dir}/styles.css`), content: read(`${dir}/${item.content}`), interactions: read(`${dir}/${item.interactions}`) };
  const pageTemplate = read(item.template);
  const html = pageTemplate.replace(/\{\{(title|description|styles|content|interactions)\}\}/g, (_, key) => values[key]);
  const output = resolve(root, item.output);
  mkdirSync(resolve(output, '..'), { recursive: true });
  writeFileSync(output, html);
}
