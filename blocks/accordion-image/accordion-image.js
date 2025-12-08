// blocks/accordion-image/accordion-image.js

/**
 * Fetch model JSON for this block using data-aue-resource
 */
async function fetchModel(block) {
  const urn = block.dataset.aueResource;

  console.log('[accordion-image] data-aue-resource:', urn);

  if (!urn) {
    console.warn('[accordion-image] No data-aue-resource on block. Cannot fetch model.');
    return null;
  }

  // urn:aemconnection:/content/abbvie/index/jcr:content/root/section_.../accordion_image
  const basePath = urn.replace('urn:aemconnection:', '');
  console.log('[accordion-image] basePath:', basePath);

  const candidates = [
    `${basePath}.model.json`,
    `${basePath}.json`,
  ];

  for (const url of candidates) {
    try {
      console.log('[accordion-image] Trying to fetch:', url);
      const resp = await fetch(url);
      console.log('[accordion-image] Response status for', url, ':', resp.status);

      if (resp.ok) {
        const data = await resp.json();
        console.log('[accordion-image] Model data from', url, ':', data);
        return data;
      }
    } catch (e) {
      console.error('[accordion-image] Error fetching', url, e);
    }
  }

  console.warn('[accordion-image] No usable model JSON found for block.');
  return null;
}

/**
 * Build one accordion item DOM node
 */
function createAccordionItem(item, index, onActivate, isActive) {
  console.log('[accordion-image] Creating accordion item', index, ':', item);

  const wrapper = document.createElement('div');
  wrapper.classList.add('accordion-item');
  if (isActive) {
    wrapper.classList.add('active');
  }

  const headerBtn = document.createElement('button');
  headerBtn.classList.add('accordion-header');
  headerBtn.setAttribute('type', 'button');

  const titleSpan = document.createElement('span');
  titleSpan.classList.add('accordion-title');
  titleSpan.textContent = item.title || '';

  const iconSpan = document.createElement('span');
  iconSpan.classList.add('accordion-icon');
  iconSpan.textContent = '▾';

  headerBtn.appendChild(titleSpan);
  headerBtn.appendChild(iconSpan);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('accordion-body');

  // body is richtext string
  if (item.body) {
    const bodyContent = document.createElement('div');
    bodyContent.classList.add('accordion-body-text');
    bodyContent.innerHTML = item.body; // comes from your richtext field
    bodyDiv.appendChild(bodyContent);
  }

  // CTA (optional)
  if (item.link && item.linkText) {
    const cta = document.createElement('a');
    cta.classList.add('accordion-cta');
    cta.href = item.link;
    cta.textContent = item.linkText;
    bodyDiv.appendChild(cta);
  }

  headerBtn.addEventListener('click', () => {
    console.log('[accordion-image] Header clicked for index:', index);
    onActivate(index);
  });

  wrapper.appendChild(headerBtn);
  wrapper.appendChild(bodyDiv);

  return wrapper;
}

/**
 * Activate an accordion item and update the right side image
 */
function activateItem(itemsEls, itemsData, index, imgEl) {
  console.log('[accordion-image] Activating item index:', index);

  itemsEls.forEach((el, i) => {
    if (i === index) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  const item = itemsData[index];
  if (!item) {
    console.warn('[accordion-image] No item data found at index:', index);
    return;
  }

  if (imgEl) {
    console.log('[accordion-image] Updating image for index:', index, 'src:', item.image);
    imgEl.src = item.image || '';
    imgEl.alt = item.imageAlt || item.title || '';
  }
}

/**
 * Main decorate function
 */
export default async function decorate(block) {
  console.log('[accordion-image] decorate() called for block:', block);

  const model = await fetchModel(block);

  if (!model) {
    console.warn('[accordion-image] No model found, leaving default markup.');
    return;
  }

  console.log('[accordion-image] Raw model object:', model);

  // Most likely your data shape is { items: [...] }
  const items = model.items || model.fields || model.data || [];
  console.log('[accordion-image] Parsed items array:', items);

  if (!Array.isArray(items) || items.length === 0) {
    console.warn('[accordion-image] No items in model.');
    return;
  }

  // Clear whatever HTML is currently inside the block
  block.innerHTML = '';

  // Outer 50-50 wrapper
  const outer = document.createElement('div');
  outer.classList.add('accordion-image-50-50');

  const left = document.createElement('div');
  left.classList.add('accordion-left');

  const right = document.createElement('div');
  right.classList.add('accordion-right');

  const imageEl = document.createElement('img');
  imageEl.classList.add('accordion-image');

  right.appendChild(imageEl);

  const itemEls = [];

  const onActivate = (idx) => activateItem(itemEls, items, idx, imageEl);

  items.forEach((item, index) => {
    const isActive = index === 0;
    const itemEl = createAccordionItem(item, index, onActivate, isActive);
    itemEls.push(itemEl);
    left.appendChild(itemEl);
  });

  outer.appendChild(left);
  outer.appendChild(right);
  block.appendChild(outer);

  // Activate first item by default
  onActivate(0);

  console.log('[accordion-image] Decoration completed.');
}
