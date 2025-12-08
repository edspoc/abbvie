// /blocks/accordion-image-50-50/accordion-image-50-50.js
import { getComponent } from '../../scripts/aem.js';

export default async function decorate(block) {
  console.log('accordion-image-50-50: decorate() called for block', block);

  // 1. Get the EDS model for this instance of the component
  const model = await getComponent(block);
  console.log('accordion-image-50-50: raw model from getComponent:', model);

  // Depending on your setup, data might be on model or model.data
  const data = model?.data || model || {};
  console.log('accordion-image-50-50: normalized data object:', data);

  const items = data.items || [];
  const optionalHeading = data.heading || data.title || data.optionalHeading || '';

  console.log('accordion-image-50-50: optionalHeading:', optionalHeading);
  console.log('accordion-image-50-50: items array:', items);

  if (!items.length) {
    console.warn('accordion-image-50-50: NO items found in model. Check model.json / authoring.');
  }

  // 2. Remove any placeholder HTML that was there before
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-image-50-50';

  // Optional heading above the 50/50 layout
  if (optionalHeading) {
    const headingEl = document.createElement('h2');
    headingEl.className = 'accordion-heading';
    headingEl.textContent = optionalHeading;
    wrapper.append(headingEl);
  }

  const layout = document.createElement('div');
  layout.className = 'accordion-image-50-50-layout';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const image = document.createElement('img');
  image.className = 'accordion-image';
  right.append(image);

  layout.append(left, right);
  wrapper.append(layout);
  block.append(wrapper);

  // 3. Build accordion items from the model
  items.forEach((item, index) => {
    console.log(`accordion-image-50-50: rendering item[${index}]`, item);

    const {
      title = '',
      body = '',
      link,
      linkText,
      image: itemImage,
      imageAlt = '',
    } = item || {};

    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    if (index === 0) accordionItem.classList.add('active');

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    titleSpan.textContent = title;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.textContent = '▾';

    header.append(titleSpan, iconSpan);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'accordion-body';
    bodyDiv.innerHTML = body || '';

    if (link && linkText) {
      const cta = document.createElement('a');
      cta.className = 'accordion-cta';
      cta.href = link;
      cta.textContent = linkText;
      bodyDiv.append(cta);
    }

    accordionItem.append(header, bodyDiv);
    left.append(accordionItem);

    // Helper to extract image src from different shapes (string or object)
    const getImageSrc = (img) => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      return img.path || img.src || img.url || '';
    };

    const imgSrc = getImageSrc(itemImage);

    // Set initial image from first item
    if (index === 0 && imgSrc) {
      console.log('accordion-image-50-50: initial image src:', imgSrc);
      image.src = imgSrc;
      image.alt = imageAlt || title || '';
    }

    // 4. Click handler – switch active item + image
    header.addEventListener('click', () => {
      console.log(`accordion-image-50-50: clicked item[${index}]`, item);

      // collapse others
      left.querySelectorAll('.accordion-item').forEach((el) => {
        el.classList.remove('active');
      });
      accordionItem.classList.add('active');

      const newSrc = getImageSrc(itemImage);
      console.log('accordion-image-50-50: switching image to:', newSrc);

      if (newSrc) {
        image.src = newSrc;
        image.alt = imageAlt || title || '';
      }
    });
  });
}
