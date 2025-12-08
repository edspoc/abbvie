// blocks/accordion-image/accordion-image.js

export default async function decorate(block) {
  console.log('[accordion-image] decorate start');

  // 1) Read AEM/EDS resource path from data-aue-resource
  const urn = block.dataset.aueResource
    || block.closest('[data-aue-resource]')?.dataset.aueResource;

  console.log('[accordion-image] urn from data-aue-resource:', urn);

  const prefix = 'urn:aemconnection:';
  if (!urn || !urn.startsWith(prefix)) {
    console.warn('[accordion-image] No valid urn:aemconnection found');
    return;
  }

  const contentPath = urn.substring(prefix.length); // /content/..../accordion_image
  const jsonUrl = `${contentPath}.json`;

  console.log('[accordion-image] contentPath:', contentPath);
  console.log('[accordion-image] jsonUrl:', jsonUrl);

  // 2) Fetch JSON for this component
  let json;
  try {
    const resp = await fetch(jsonUrl);
    if (!resp.ok) {
      console.error('[accordion-image] Failed to fetch JSON', resp.status, resp.statusText);
      return;
    }
    json = await resp.json();
  } catch (e) {
    console.error('[accordion-image] Error fetching JSON', e);
    return;
  }

  console.log('[accordion-image] raw JSON:', json);

  // 3) Get items array from JSON
  // In most EDS setups you’ll either get { items: [...] } or just [...]
  const items = Array.isArray(json)
    ? json
    : (json.items || json.data || []);

  console.log('[accordion-image] items parsed:', items);

  if (!Array.isArray(items) || items.length === 0) {
    console.warn('[accordion-image] No items found in JSON');
    return;
  }

  // 4) Clear authoring placeholder markup
  block.innerHTML = '';

  // 5) Build base layout (50/50)
  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-image-50-50';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const img = document.createElement('img');
  img.className = 'accordion-image';
  right.appendChild(img);

  wrapper.append(left, right);
  block.append(wrapper);

  // 6) Build accordion items
  items.forEach((item, index) => {
    console.log('[accordion-image] building item', index, item);

    const {
      title = '',
      body = '',
      link,
      linkText,
      image,
      imageAlt = '',
    } = item;

    const itemEl = document.createElement('div');
    itemEl.className = 'accordion-item';
    if (index === 0) itemEl.classList.add('active');

    const headerBtn = document.createElement('button');
    headerBtn.type = 'button';
    headerBtn.className = 'accordion-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    titleSpan.textContent = title || '';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.textContent = '▾';

    headerBtn.append(titleSpan, iconSpan);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'accordion-body';

    if (body) {
      const bodyText = document.createElement('div');
      bodyText.className = 'accordion-body-text';
      bodyText.innerHTML = body; // body is already HTML from model
      bodyEl.appendChild(bodyText);
    }

    if (link && linkText) {
      const cta = document.createElement('a');
      cta.className = 'accordion-cta';
      cta.href = link;
      cta.textContent = linkText;
      bodyEl.appendChild(cta);
    }

    itemEl.append(headerBtn, bodyEl);
    left.appendChild(itemEl);

    // click handler
    headerBtn.addEventListener('click', () => {
      console.log('[accordion-image] header clicked', index);

      // deactivate all
      left.querySelectorAll('.accordion-item').forEach((el) => {
        el.classList.remove('active');
      });

      // activate this one
      itemEl.classList.add('active');

      // update image
      if (image) {
        img.src = image;
        img.alt = imageAlt || title || '';
      } else {
        img.removeAttribute('src');
        img.alt = '';
      }
    });

    // set initial image from first item
    if (index === 0 && image) {
      img.src = image;
      img.alt = imageAlt || title || '';
    }
  });

  console.log('[accordion-image] decorate end');
}
