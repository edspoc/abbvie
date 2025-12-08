// blocks/accordion-image-50-50/accordion-image-50-50.js

/**
 * Extracts the AEM content path from the data-aue-resource attribute.
 * Example:
 *   urn:aemconnection:/content/abbvie/index/jcr:content/...  ->  /content/abbvie/index/jcr:content/...
 */
function getAemContentPathFromBlock(block) {
  const resourceEl = block.closest('[data-aue-resource]');
  if (!resourceEl) {
    console.warn('[accordion-image-50-50] No data-aue-resource attribute found');
    return null;
  }

  const urn = resourceEl.getAttribute('data-aue-resource') || '';
  const parts = urn.split(':');
  const path = parts[parts.length - 1]; // take everything after last colon
  console.log('[accordion-image-50-50] aem content path:', path);
  return path;
}

/**
 * Tries to find the "items" array in the model.json response.
 * This is defensive so it works even if the JSON structure is slightly different.
 */
function extractItemsFromModel(modelJson) {
  if (!modelJson || typeof modelJson !== 'object') {
    console.warn('[accordion-image-50-50] modelJson is not an object', modelJson);
    return [];
  }

  // direct items on root
  if (Array.isArray(modelJson.items)) {
    return modelJson.items;
  }

  // items under data -> <component-id> -> items
  if (modelJson.data && typeof modelJson.data === 'object') {
    const data = modelJson.data;
    const keys = Object.keys(data);
    for (const key of keys) {
      if (Array.isArray(data[key]?.items)) {
        return data[key].items;
      }
    }
  }

  console.warn('[accordion-image-50-50] could not find items array in model.json', modelJson);
  return [];
}

/**
 * Updates the image on the right side when an accordion item is active.
 */
function updateRightImage(rightContainer, item) {
  const imgEl = rightContainer.querySelector('img.accordion-image');
  if (!imgEl) return;

  const imagePath =
    (Array.isArray(item.image) && item.image[0]?.path) ||
    (Array.isArray(item.image) && item.image[0]) ||
    item.image ||
    '';

  imgEl.src = imagePath || '';
  imgEl.alt = item.imageAlt || '';
}

/**
 * Main decorate function called by Franklin.
 */
export default async function decorate(block) {
  console.log('[accordion-image-50-50] decorate start');

  // 1. Fetch model.json
  const contentPath = getAemContentPathFromBlock(block);
  if (!contentPath) {
    return;
  }

  let modelJson;
  try {
    const resp = await fetch(`${contentPath}.model.json`);
    if (!resp.ok) {
      console.error('[accordion-image-50-50] failed to fetch model.json', resp.status);
      return;
    }
    modelJson = await resp.json();
  } catch (e) {
    console.error('[accordion-image-50-50] error fetching model.json', e);
    return;
  }

  console.log('[accordion-image-50-50] model.json:', modelJson);

  const items = extractItemsFromModel(modelJson);
  console.log('[accordion-image-50-50] extracted items:', items);

  if (!items.length) {
    // nothing to render
    return;
  }

  // 2. Clear block and build 50/50 layout
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-image-50-50';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const img = document.createElement('img');
  img.className = 'accordion-image';
  right.appendChild(img);

  wrapper.appendChild(left);
  wrapper.appendChild(right);
  block.appendChild(wrapper);

  // 3. Build accordion items
  items.forEach((item, index) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    if (index === 0) {
      accordionItem.classList.add('active');
    }

    const headerBtn = document.createElement('button');
    headerBtn.type = 'button';
    headerBtn.className = 'accordion-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    titleSpan.textContent = item.title || '';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.textContent = '▾';

    headerBtn.appendChild(titleSpan);
    headerBtn.appendChild(iconSpan);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'accordion-body';

    if (item.body) {
      const bodyContent = document.createElement('div');
      bodyContent.className = 'accordion-body-content';
      bodyContent.innerHTML = item.body; // body is richtext HTML
      bodyDiv.appendChild(bodyContent);
    }

    if (item.link) {
      const link = document.createElement('a');
      link.className = 'accordion-cta';
      link.href = item.link;
      link.textContent = item.linkText || item.link;
      bodyDiv.appendChild(link);
    }

    accordionItem.appendChild(headerBtn);
    accordionItem.appendChild(bodyDiv);
    left.appendChild(accordionItem);

    // click handler
    headerBtn.addEventListener('click', () => {
      // remove active from others
      left.querySelectorAll('.accordion-item').forEach((el) => el.classList.remove('active'));
      accordionItem.classList.add('active');
      updateRightImage(right, item);
    });

