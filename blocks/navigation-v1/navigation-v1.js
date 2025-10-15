// /blocks/navigation-v1/navigation-v1.js

function toArray(nl) { return Array.prototype.slice.call(nl || []); }

function pickCanonicalContent(root) {
  // 1) ensure we have exactly one canonical content element
  let canonical = root.querySelector(':scope > .navigation-v1__content');
  if (!canonical) {
    canonical = document.createElement('div');
    canonical.className = 'navigation-v1__content';
    canonical.setAttribute('data-aue-prop', 'menuHtml');
    canonical.setAttribute('data-aue-type', 'richtext');
    canonical.setAttribute('data-aue-label', 'Navigation Menu');
    root.appendChild(canonical);
  }

  // 2) if canonical is empty, look for a donor:
  //    - any descendant with data-aue-prop="menuHtml"
  //    - otherwise the first child DIV that contains a UL or links/text
  const hasContent = (el) => el && el.innerHTML.trim().length > 0;
  if (!hasContent(canonical)) {
    const ueDonor = root.querySelector('[data-aue-prop="menuHtml"]:not(.navigation-v1__content)');
    let donor = ueDonor;
    if (!donor) {
      donor = toArray(root.children).find((c) =>
        c !== canonical &&
        !!c.querySelector('ul, a, p, span, strong, em') &&
        c.innerHTML.trim().length > 0
      );
    }
    if (donor && donor !== canonical) {
      // MOVE nodes (preserve anchors, attributes)
      while (donor.firstChild) canonical.appendChild(donor.firstChild);
      // remove the now-empty donor wrapper to avoid duplicate shells
      donor.remove();
    }
  }

  // 3) remove any extra menuHtml elements (keep canonical)
  toArray(root.querySelectorAll('[data-aue-prop="menuHtml"]'))
    .forEach((n) => { if (n !== canonical) n.remove(); });

  return canonical;
}

function buildULFromContent(contentEl) {
  // prefer top-level UL; else build UL from links/lines
  const directUL = contentEl.querySelector(':scope > ul');
  if (directUL) return directUL.cloneNode(true);

  const ul = document.createElement('ul');
  const links = toArray(contentEl.querySelectorAll(':scope > a, :scope > p > a'));
  if (links.length) {
    links.forEach((a) => {
      const li = document.createElement('li');
      li.appendChild(a.cloneNode(true));
      ul.appendChild(li);
    });
  } else {
    // fallback: split by block-level children
    toArray(contentEl.children).forEach((el) => {
      const txt = el.textContent.trim();
      if (txt) {
        const li = document.createElement('li');
        li.textContent = txt;
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

function render(wrapper) {
  const contentEl = pickCanonicalContent(wrapper);

  // rebuild nav
  const prev = wrapper.querySelector('nav.navigation-v1');
  if (prev) prev.remove();

  const ul = enhanceDropdowns(buildULFromContent(contentEl));
  const nav = document.createElement('nav');
  nav.className = 'navigation-v1';
  nav.setAttribute('aria-label', 'Primary navigation');
  nav.appendChild(ul);
  wrapper.appendChild(nav);

  // keep UE source but hide it in runtime
  contentEl.hidden = true;
}

export default function decorate(block) {
  // reuse wrapper if already present
  let wrapper = block.querySelector(':scope > .navigation-v1__wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'navigation-v1__wrapper';
    while (block.firstChild) wrapper.appendChild(block.firstChild);
    block.appendChild(wrapper);
  }

  // avoid infinite re-renders: disconnect MO while rendering
  let busy = false;
  const mo = new MutationObserver(() => {
    if (busy) return;
    busy = true;
    try { render(wrapper); } finally { busy = false; }
  });

  render(wrapper);
  mo.observe(wrapper, { childList: true, subtree: true, characterData: true });
}
