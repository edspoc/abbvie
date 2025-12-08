// blocks/accordion-image-50-50/accordion-image-50-50.js
import { getAemContentPath } from '../../scripts/aem.js'; // ✅ this exists in EDS starter

export default async function decorate(block) {
  console.log('[accordion-image-50-50] decorate() start');

  // 1) Find the AEM resource URN from the wrapper
  const wrapper = block.closest('[data-aue-resource]');
  if (!wrapper) {
    console.warn('[accordion-image-50-50] no data-aue-resource found');
    return;
  }

  const urn = wrapper.dataset.aueResource;
  console.log('[accordion-image-50-50] data-aue-resource =', urn);

  // 2) Turn URN into AEM content path
  const path = getAemContentPath(urn);
  console.log('[accordion-image-50-50] AEM path =', path);

  const modelUrl = `${path}.model.json`;
  console.log('[accordion-image-50-50] model URL =', modelUrl);

  // 3) Fetch model.json
  let model;
  try {
    const res = await fetch(modelUrl);
    console.log('[accordion-image-50-50] model fetch status =', res.status);

    if (!res.ok) {
      console.error('[accordion-image-50-50] model fetch failed', res.status, res.statusText);
      return;
    }
    model = await res.json();
  } catch (e) {
    console.error('[accordion-image-50-50] model fetch error', e);
    return;
  }

  console.log('[accordion-image-50-50] raw model.json =', model);

  // Depending on how xwalk maps it, items may be under fields/items or directly items
  const items =
    model?.items ||
    model?.fields?.items ||
    model?.accordionItems ||
    [];

  console.log('[accordion-image-50-50] resolved items =', items);

  if (!items.length) {
    console.warn('[accordion-image-50-50] no items in model – check model.json');
  }

  // 4) Build DOM
  block.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'accordion-image-50-50';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const img = document.createElement('img');
  img.className = 'accordion-image';
  right.appendChild(img);

  root.append(left, right);
  block.append(root);

  // 5) Create accordion items from model
  items.forEach((item, index) => {
    console.log(`[accordion-image-50-50] building item[${index}] =`, item);

    const accItem = document.createElement('div');
    accItem.className = 'accordion-item';
    if (index === 0) accItem.classList.add('active');

    const headerBtn = document.createElement('button');
    headerBtn.type = 'button';
    headerBtn.className = 'accordion-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    titleSpan.textContent = item.title || '';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.textContent = '▾';

    headerBtn.append(titleSpan, iconSpan);

    const body = document.createElement('div');
    body.className = 'accordion-body';

    if (item.body) {
      // body is richtext HTML from the model
      body.innerHTML = item.body;
    }

    if (item.link && item.linkText) {
      const cta = document.createElement('a');
      cta.href = item.link;
      cta.textContent = item.linkText;
      cta.className = 'accordion-cta';
      body.appendChild(cta);
    }

    accItem.append(headerBtn, body);
    left.appendChild(accItem);

    // click handler
    headerBtn.addEventListener('click', () => {
      console.log(`[accordion-image-50-50] clicked item[${index}]`);

      // deactivate all
      left.querySelectorAll('.accordion-item').forEach((n) => {
        n.classList.remove('active');
      });

      // activate this
      accItem.classList.add('active');

      // change image
      if (item.image) {
        img.src = item.image;
        img.alt = item.imageAlt || '';
        console.log('[accordion-image-50-50] image set to', item.image);
      }
    });

    // Set initial image from first item
    if (index === 0 && item.image) {
      img.src = item.image;
      img.alt = item.imageAlt || '';
      console.log('[accordion-image-50-50] initial image =', item.image);
    }
  });

  console.log('[accordion-image-50-50] decorate() done');
}
