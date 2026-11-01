const list = document.getElementById('case-list');
const cases = Array.isArray(window.PORTFOLIO_CASES) ? window.PORTFOLIO_CASES : [];
if (list && cases.length) {
  list.replaceChildren(...cases.map(item => {
    const a = document.createElement('a'); a.className = 'case-card'; a.href = item.href;
    const img = document.createElement('img'); img.src = item.cover; img.alt = 'Обложка кейса: ' + item.title;
    const info = document.createElement('div'); info.className = 'case-info';
    const meta = document.createElement('div'); meta.className = 'case-meta';
    for (const value of [item.category, item.year]) { const span = document.createElement('span'); span.textContent = value.toUpperCase(); meta.append(span); }
    const h = document.createElement('h3'); h.textContent = item.title + ' ↗';
    const p = document.createElement('p'); p.textContent = item.description;
    const label = document.createElement('span'); label.className = 'case-read'; label.textContent = 'ИЗУЧИТЬ КЕЙС →';
    info.append(meta, h, p, label); a.append(img, info); return a;
  }));
}
