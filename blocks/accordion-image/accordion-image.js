/**
 * accordion-image.js
 * Self-contained EDS block JS (no external imports)
 */

/**
 * Get AEM content path from data-aue-resource
 * Example:
 * urn:aemconnection:/content/abbvie/index/jcr:content/...
 * → /content/abbvie/index/jcr:content/...
 */
function getAemPath(block) {
  const el = block.closest('[data-aue-resource]');
  if (!el) {
    console.warn('[AIM5050] data-aue-resource not found');
    return null;
  }

  const urn = el.getAttribute('data-aue-resource');
  console.log('[AIM5050] urn:', urn);

  const path = urn.split(':').pop();
  console.log('[AIM5050] resolved content path:', path);

  return path;
}

/**
 * Safely extract items array from model.json
 */
function extractItems(model) {
  console.log('[AIM5050] raw model.json:', model);

  if (Array.isArray(model?.items)) return model.items;
  if (model?.fields?.items) return model.fields.items;

  if (model?.data) {
    for (const key of Object.keys(model.data)) {
      if (Array.isArray(model.data[key]?.items)) {
        return model.data[key].items;
      }
    }
  }

  console.warn('[AIM5050] No items found in model');
  return [];
}

/**
 * Resolve image path (reference field can be string or array/object)
 */
function resolveImage(item) {
  const img = item?.image;

  if (!img) return '';

  if (typeof img === 'string') return img;
  if (Array.isArray(img)) return img[0]?.path || img[0];
  if (typeof img === 'object') return img.path || '';

  return '';
}

export default async function decorate(block) {
  console.log('[AIM5050] decorate() called');

  /* 1. Fetch model.json */
  const contentPath = getAemPath(block);
  if (!contentPath) return;

  let model;
  try {
    const res = await fetch(`${contentPath}.model.json`);
    console.log('[AIM5050] model.json status:', res.status);

    if (!res.ok) return;
    model = await res.json();
  } catch (e) {
    console.error('[AIM5050] model.json fetch failed', e);
    return;
  }

  const items = extractItems(model);
  console.log('[AIM5050] extracted items:', items);

  if (!items.length) return;

  /* 2. Build base layout (50 / 50) */
  block.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'accordion-image';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const image = document.createElement('img');
  image.className = 'accordion-image';
  right.appendChild(image);

  root.append(left, right);
  block.appendChild(root);

  /* 3. Build accordion items */
  items.forEach((item, index) => {
    console.log(`[AIM5050] item[${index}]`, item);

    const acc = document.createElement('div');
    acc.className = 'accordion-item';
    if (index === 0) acc.classList.add('active');

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-header';

    const title = document.createElement('span');
    title.className = 'accordion-title';
    title.textContent = item.title || '';

    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.textContent = '▾';

    header.append(title, icon);

    const body = document.createElement('div');
    body.className = 'accordion-body';
    body.innerHTML = item.body || '';

    if (item.link) {
      const cta = document.createElement('a');
      cta.className = 'accordion-cta';
      cta.href = item.link;
      cta.textContent = item.linkText || item.link;
      body.appendChild(cta);
    }

    acc.append(header, body);
    left.appendChild(acc);

    const imgSrc = resolveImage(item);

    // initial image
    if (index === 0 && imgSrc) {
      image.src = imgSrc;
      image.alt = item.imageAlt || '';
      console.log('[AIM5050] initial image:', imgSrc);
    }

    header.addEventListener('click', () => {
      console.log(`[AIM5050] clicked item[${index}]`);

      left.querySelectorAll('.accordion-item')
        .forEach((el) => el.classList.remove('active'));

      acc.classList.add('active');

      if (imgSrc) {
        image.src = imgSrc;
        image.alt = item.imageAlt || '';
        console.log('[AIM5050] image switched to:', imgSrc);
      }
    });
  });

  console.log('[AIM5050] decorate() completed');
}
