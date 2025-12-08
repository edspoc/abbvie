// /blocks/accordion-image/accordion-image.js

export default async function decorate(block) {
  console.log('accordion-image: init', block);

  // 1. Find the AEM resource for this block
  const resourceEl = block.closest('[data-aue-resource]') || block;
  const urn = resourceEl.dataset.aueResource;

  if (!urn) {
    console.warn('accordion-image: no data-aue-resource on block, aborting');
    return;
  }

  // urn:aemconnection:/content/abbvie/index/jcr:content/root/section_xxxx/accordion_image
  const contentPath = urn.replace('urn:aemconnection:', '');
  const modelUrl = `${contentPath}.model.json`;

  console.log('accordion-image: contentPath =', contentPath);
  console.log('accordion-image: modelUrl   =', modelUrl);

  // 2. Fetch the model JSON for this component
  let model;
  try {
    const resp = await fetch(modelUrl);
    console.log('accordion-image: model response status =', resp.status);

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    model = await resp.json();
  } catch (e) {
    console.error('accordion-image: failed to load model.json', e);
    return;
  }

  console.log('accordion-image: raw model.json =', model);

  /**
   * Try to locate the items array.
   * For your model it should be something like:
   * {
   *   "items": [
   *     { title, body, link, linkText, image, imageAlt },
   *     ...
   *   ]
   * }
   */
  let items = model.items;
  if (!items && Array.isArray(model)) {
    // fallback in case the model itself is an array
    items = model;
  }

  console.log('accordion-image: resolved items =', items);

  if (!Array.isArray(items) || items.length === 0) {
    console.warn('accordion-image: no accordion items in model, nothing to render');
    return;
  }

  // 3. Clear what editor put inside and build our own layout
  block.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'accordion-image-50-50'; // use this in your CSS for 50/50 layout

  const leftCol = document.createElement('div');
  leftCol.className = 'accordion-left';

  const rightCol = document.createElement('div');
  rightCol.className = 'accordion-right';

  const imageEl = document.createElement('img');
  imageEl.className = 'accordion-image-main';
  rightCol.appendChild(imageEl);

  layout.append(leftCol, rightCol);
  block.appendChild(layout);

  // Helper: set main image
  const setMainImage = (item, index) => {
    if (!item) return;
    console.log(`accordion-image: setMainImage for index ${index}`, item.image);
    if (item.image) {
      imageEl.src = item.image;
      imageEl.alt = item.imageAlt || '';
    } else {
      imageEl.removeAttribute('src');
      imageEl.alt = '';
    }
  };

  // 4. Build the accordion items
  items.forEach((item, index) => {
    console.log(`accordion-image: rendering item[${index}]`, item);

    const accItem = document.createElement('div');
    accItem.className = 'accordion-item';
    if (index === 0) {
      accItem.classList.add('active');
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

    headerBtn.append(titleSpan, iconSpan);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'accordion-body';

    if (item.body) {
      const bodyContent = document.createElement('div');
      bodyContent.className = 'accordion-body-text';
      bodyContent.innerHTML = item.body; // body is already HTML from the rich text field
      bodyDiv.appendChild(bodyContent);
    }

    if (item.link && item.linkText) {
      const cta = document.createElement('a');
      cta.className = 'accordion-cta';
      cta.href = item.link;
      cta.textContent = item.linkText;
      bodyDiv.appendChild(cta);
    }

    accItem.append(headerBtn, bodyDiv);
    leftCol.appendChild(accItem);

    // Click handler: open this item + change image
    headerBtn.addEventListener('click', () => {
      console.log('accordion-image: header click index =', index);

      // close all others
      leftCol.querySelectorAll('.accordion-item.active').forEach((el) => {
        el.classList.remove('active');
      });

      accItem.classList.add('active');
      setMainImage(item, index);
    });

    // Initial image = first item
    if (index === 0) {
      setMainImage(item, index);
    }
  });

  console.log('accordion-image: decoration complete');
}
