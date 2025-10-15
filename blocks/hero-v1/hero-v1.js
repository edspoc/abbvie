// /blocks/hero-v1/hero-v1.js
export default function decorate(block) {
  // --- collect authored bits ---
  const picture = block.querySelector('picture') || null;
  const titleEl = block.querySelector('[data-aue-prop="title"]') || null;
  const bodyEl  = block.querySelector('[data-aue-prop="body"]')  || null;

  // Optional: authorable panel heading if you add a field later
  const panelTitleEl = block.querySelector('[data-aue-prop="panelTitle"]');
  const panelTitle = panelTitleEl?.textContent?.trim() || 'CHOOSE YOUR CONDITION';

  // CTAs come as: <p data-aue-prop="ctaX_label">...</p> + sibling <a>
  const labelPs = [...block.querySelectorAll('[data-aue-prop$="_label"]')];
  const ctas = labelPs.map((p) => {
    const label = (p.textContent || '').trim();
    const row = p.closest('div');
    const a = row?.querySelector('a');
    const href = a?.getAttribute('href') || (a?.textContent || '').trim() || '#';
    if (!label) return null; // render even if href is '#'
    return { label, href };
  }).filter(Boolean);

  // --- build our own structure ---
  const root  = document.createElement('div');
  root.className = 'hero-v1';

  const bg = document.createElement('div');
  bg.className = 'hero-v1__bg';
  if (picture) bg.append(picture);

  const inner = document.createElement('div');
  inner.className = 'hero-v1__inner';

  // LEFT PANEL (SKYRIZI-style card with heading + stacked CTAs)
  const left = document.createElement('div');
  left.className = 'hero-v1__left';

  const card = document.createElement('div');
  card.className = 'hero-v1__card';

  const heading = document.createElement('p');
  heading.className = 'hero-v1__card-title';
  heading.textContent = panelTitle;
  card.append(heading);

  if (ctas.length) {
    const list = document.createElement('div');
    list.className = 'hero-v1__cta-list';
    ctas.forEach(({ label, href }) => {
      const item = document.createElement('div');
      item.className = 'hero-v1__cta';
      const btn = document.createElement('a');
      btn.className = 'hero-v1__btn';
      btn.textContent = label;
      btn.href = href;
      btn.target = '_self'; // change to '_blank' if required
      btn.rel = 'noopener';
      item.append(btn);
      list.append(item);
    });
    card.append(list);
  }
  left.append(card);

  // RIGHT SIDE (title + body)
  const right = document.createElement('div');
  right.className = 'hero-v1__right';
  if (titleEl) { titleEl.classList.add('hero-v1__title'); right.append(titleEl); }
  if (bodyEl)  { bodyEl.classList.add('hero-v1__body');  right.append(bodyEl); }

  inner.append(left, right);
  root.append(bg, inner);


  // swap original rows
  block.textContent = '';
  block.append(root);

  // aria label from title
  const t = titleEl?.textContent?.trim();
  if (t && !block.getAttribute('aria-label')) block.setAttribute('aria-label', t);
}
