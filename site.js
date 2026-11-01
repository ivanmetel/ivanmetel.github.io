const list = document.getElementById('case-list');
const cases = Array.isArray(window.PORTFOLIO_CASES) ? window.PORTFOLIO_CASES : [];
if (list && cases.length) {
  list.replaceChildren(...cases.map((item, index) => {
    const pending = item.status === 'pending';
    const card = document.createElement(pending ? 'article' : 'a');
    card.className = 'case-card' + (pending ? ' case-card--pending' : '');
    if (!pending) card.href = item.href;
    if (pending) {
      const cover = document.createElement('div'); cover.className = 'pending-visual';
      for (const text of [String(index + 1).padStart(2, '0'), 'КЕЙС ГОТОВИТСЯ']) { const span = document.createElement('span'); span.textContent = text; cover.append(span); }
      card.append(cover);
    } else {
      const img = document.createElement('img'); img.src = item.cover; img.alt = ''; card.append(img);
    }
    const info = document.createElement('div'); info.className = 'case-info';
    const meta = document.createElement('div'); meta.className = 'case-meta';
    for (const value of [item.category, item.year].filter(Boolean)) { const span = document.createElement('span'); span.textContent = value.toUpperCase(); meta.append(span); }
    const h = document.createElement('h3'); h.textContent = item.title;
    const p = document.createElement('p'); p.textContent = item.description;
    const label = document.createElement('span'); label.className = 'case-read'; label.textContent = pending ? 'СКОРО' : 'Изучить кейс ';
    if (!pending) label.insertAdjacentHTML('beforeend', '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>');
    info.append(meta, h, p, label); card.append(info); return card;
  }));
}
