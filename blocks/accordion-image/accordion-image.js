export default async function decorate(block) {
  // 1. get the AEM resource path from the block wrapper
  const wrapper = block.closest('[data-aue-resource]');
  if (!wrapper) {
    console.warn('[accordion-image] No data-aue-resource found');
    return;
  }

  const urn = wrapper.dataset.aueResource; // e.g. urn:aemconnection:/content/abbvie/...
  const resourcePath = urn.replace('urn:aemconnection:', '');

  console.log('[accordion-image] resourcePath:', resourcePath);

  // 2. fetch the model JSON for THIS instance on the page
  const res = await fetch(`${resourcePath}.model.json`);
  if (!res.ok) {
    console.error('[accordion-image] failed to load model.json', res.status, res.statusText);
    return;
  }

  const json = await res.json();
  console.log('[accordion-image] raw JSON from AEM:', json);

  // 3. read items (adjust if your data shape is different)
  const items = json.items || [];
  console.log('[accordion-image] items parsed:', items);

  if (!items.length) {
    console.warn('[accordion-image] No items in model.json');
    return;
  }

  // 4. clear existing markup
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

  // build accordion items
  items.forEach((item, index) => {
    const accItem = document.createElement('div');
    accItem.classList.add('accordion-item');
    if (index === 0) accItem.classList.add('active');

    const header = document.createElement('button');
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

    // CTA
    if (item.link && item.linkText) {
      const cta = document.createElement('a');
      cta.href = item.link;
      cta.textContent = item.linkText;
      cta.classList.add('accordion-cta');
      body.appendChild(cta);
    }

    // click handler
    header.addEventListener('click', () => {
      document
        .querySelectorAll('.accordion-item')
        .forEach((el) => el.classList.remove('active'));
      accItem.classList.add('active');

      if (item.image) {
        imgEl.src = item.image;
        imgEl.alt = item.imageAlt || '';
      }
    });

    accItem.appendChild(header);
    accItem.appendChild(body);
    left.appendChild(accItem);

    // set initial image from first item
    if (index === 0 && item.image) {
      imgEl.src = item.image;
      imgEl.alt = item.imageAlt || '';
    }
  });

  wrapperDiv.appendChild(left);
  wrapperDiv.appendChild(right);
  block.appendChild(wrapperDiv);
}
