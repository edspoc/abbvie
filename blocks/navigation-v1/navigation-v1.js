// /blocks/navigation-v1/navigation-v1.js

function toArray(nl) { return Array.prototype.slice.call(nl || []); }

function pickCanonicalContent(block) {
  // Find all menuHtml nodes
  const all = toArray(block.querySelectorAll('[data-aue-prop="menuHtml"]'));

  // Use the one with our canonical class if present, else create it.
  let canonical = all.find((n) => n.classList.contains('navigation-v1__content'));
  if (!canonical) {
    canonical = document.createElement('div');
    canonical.className = 'navigation-v1__content';
    canonical.setAttribute('data-aue-prop', 'menuHtml');
    canonical.setAttribute('data-aue-type', 'richtext');
    canonical.setAttribute('data-aue-label', 'Navigation Menu');
    block.appendChild(canonical);
  }

  // If another menuHtml has authored content and canonical is empty, migrate it.
  const donor = all.find((n) => n !== canonical && n.innerHTML.trim().length);
  if (donor && canonical.innerHTML.trim().length === 0) {
    canonical.innerHTML = donor.innerHTML;
  }

  // Remove duplicates (keep only canonical)
  all.forEach((n) => { if (n !== canonical) n.remove(); });

  return canonical;
}

function buildULFromContent(contentEl) {
  // Use first top-level UL if present; else build UL from links/paras
  let ul = contentEl.querySelector(':scope > ul');
  if (ul) return ul.cloneNode(true);

  const links = toArray(contentEl.querySelectorAll('a'));
  ul = document.createElement('ul');
  if (links.length) {
    links.forEach((a) => {
      const li = document.createElement('li');
      li.appendChild(a.cloneNode(true));
      ul.appendChild(li);
    });
  } else {
    // fallback: turn top-level list items (text) into LIs
    toArray(contentEl.childNodes).forEach((node) => {
      const text = (node.textContent || '').trim();
      if (text) {
        const li = document.createElement('li');
        li.textContent = text;
        ul.appendChild(li);
      }
    });
  }
  return ul;
}

function enhanceDropdowns(ul) {
  ul.className = 'navigation-v1__list';
  toArray(ul.children).forEach((li) => {
    li.classList.add('navigation-v1__item');
    const childUL = li.querySelector(':scope > ul');
    if (childUL) {
      li.classList.add('has-dropdown');
      childUL.classList.add('navigation-v1__dropdown');

      const toggle = document.createElement('button');
      toggle.className = 'navigation-v1__toggle';
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span aria-hidden="true">▾</span>';

      const first = li.querySelector(':scope > a, :scope > span, :scope > strong') || li.firstChild;
      if (first && first.nextSibling) li.insertBefore(toggle, first.nextSibling);
      else li.appendChild(toggle);

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const open = li.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
  });
  return ul;
}

function render(block) {
  // 1) Ensure exactly ONE binding target and migrate content into it
  const contentEl = pickCanonicalContent(block);

  // 2) Rebuild nav from the canonical content
  const prev = block.querySelector('nav.navigation-v1');
  if (prev) prev.remove();

  const ul = enhanceDropdowns(buildULFromContent(contentEl));
  const nav = document.createElement('nav');
  nav.className = 'navigation-v1';
  nav.setAttribute('aria-label', 'Primary navigation');
  nav.appendChild(ul);
  block.appendChild(nav);

  // 3) Hide the authored RTE source (stay in DOM for UE editing)
  contentEl.hidden = true;
}

export default function decorate(block) {
  // Wrap without nuking UE nodes
  const wrapper = document.createElement('div');
  wrapper.className = 'navigation-v1__wrapper';
  while (block.firstChild) wrapper.appendChild(block.firstChild);
  block.appendChild(wrapper);

  render(wrapper);

  // Live updates when UE changes the richtext
  const mo = new MutationObserver(() => render(wrapper));
  mo.observe(wrapper, { childList: true, subtree: true, characterData: true });
}
