// blocks/accordion-image/accordion-image.js

function buildUi(block, items) {
  // wipe author-time markup
  block.innerHTML = '';

  const wrapperDiv = document.createElement('div');
  wrapperDiv.classList.add('accordion-image-50-50');

  const left = document.createElement('div');
  left.classList.add('accordion-left');

  const right = document.createElement('div');
  right.classList.add('accordion-right');

  const imgEl = document.createElement('img');
  imgEl.classList.add('accordion-image');
  right.appendChild(imgEl);

  items.forEach((item, index) => {
    const accItem = document.createElement('div');
    accItem.classList.add('accordion-item');
    if (index === 0) accItem.classList.add('active');

    const header = document.createElement('button');
    header.type = 'button';
    header.classList.add('accordion-header');

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('accordion-title');
    titleSpan.textContent = item.title || '';

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('accordion-icon');
    iconSpan.textContent = '▾';

    header.appendChild(titleSpan);
    header.appendChild(iconSpan);

    const body = document.createElement('div');
    body.classList.add('accordion-body');
    if (item.body) {
      body.innerHTML = item.body;
    }

    if (item.link && item.linkText) {
      const cta = document.createElement('a');
      cta.href = item.link;
      cta.textContent = item.linkText;
      cta.classList.add('accordion-cta');
      body.appendChild(cta);
    }

    header.addEventListener('click', () => {
      left.querySelectorAll('.accordion-item').forEach((el) => el.classList.remove('active'));
      accItem.classList.add('active');

      if (item.image) {
        imgEl.src = item.image;
        imgEl.alt = item.imageAlt || '';
      }
    });

    accItem.appendChild(header);
    accItem.appendChild(body);
    left.appendChild(accItem);

    if (index === 0 && item.image) {
      imgEl.src = item.image;
      imgEl.alt = item.imageAlt || '';
    }
  });

  wrapperDiv.appendChild(left);
  wrapperDiv.appendChild(right);
  block.appendChild(wrapperDiv);
}

function readItemsFromJson(json) {
  // json is /accordion_image/items.1.json
  const items = [];
  Object.keys(json).forEach((key) => {
    if (!key.startsWith('item')) return;
    const node = json[key];
    items.push({
      title: node.title || '',
      body: node.body || '',
      link: node.link || '',
      linkText: node.linkText || '',
      image: node.image || '',
      imageAlt: node.imageAlt || '',
    });
  });
  return items;
}

function readItemsFromHtml(block) {
  // fallback for main--eds: read from authored HTML
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    // adjust if your authoring format is different
    const title = cells[0]?.textContent?.trim();
    if (!title) return;

    const bodyHtml = cells[1]?.innerHTML || '';
    const linkEl = cells[2]?.querySelector('a');
    const imagePath = cells[3]?.textContent?.trim() || '';
    const imageAlt = cells[4]?.textContent?.trim() || '';

    items.push({
      title,
      body: bodyHtml,
      link: linkEl?.href || '',
      linkText: linkEl?.textContent?.trim() || '',
      image: imagePath,
      imageAlt,
    });
  });
  return items;
}

export default async function decorate(block) {
  // ----------- MODE 1: AEM (author / publish) -----------
  const wrapper = block.closest('[data-aue-resource]');
  if (wrapper) {
    const urn = wrapper.dataset.aueResource;
    const resourcePath = urn.replace('urn:aemconnection:', '');
    console.log('[accordion-image] resourcePath:', resourcePath);

    // read items.*.json to get the child nodes under /items
    const itemsUrl = `${resourcePath}/items.1.json`;
    console.log('[accordion-image] fetching:', itemsUrl);

    const res = await fetch(itemsUrl);
    if (!res.ok) {
      console.error('[accordion-image] failed to load items json', res.status);
      return;
    }

    const json = await res.json();
    console.log('[accordion-image] raw items json:', json);

    const items = readItemsFromJson(json);
    if (!items.length) {
      console.warn('[accordion-image] no items in json');
      return;
    }

    buildUi(block, items);
    return;
  }

  // ----------- MODE 2: main--eds (no AEM) -----------
  console.log('[accordion-image] no data-aue-resource, using HTML fallback');
  const items = readItemsFromHtml(block);
  if (!items.length) {
    console.warn('[accordion-image] no items in HTML fallback');
    return;
  }
  buildUi(block, items);
}
