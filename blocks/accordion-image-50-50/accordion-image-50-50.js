async function fetchModel(block) {
  const urn = block.dataset.aueResource;
  if (!urn) return null;

  // urn:aemconnection:/content/abbvie/index/jcr:content/...
  const resourcePath = urn.replace('urn:aemconnection:', '');
  const modelUrl = `${resourcePath}.model.json`;

  try {
    const resp = await fetch(modelUrl);
    if (!resp.ok) {
      console.warn('accordion-image-50-50: model fetch failed', modelUrl, resp.status);
      return null;
    }
    return resp.json();
  } catch (e) {
    console.error('accordion-image-50-50: model fetch error', e);
    return null;
  }
}

export default async function decorate(block) {
  // 1. Load model data
  const model = (await fetchModel(block)) || {};
  const items = model.items || [];

  // If nothing authored, just bail
  if (!items.length) {
    block.innerHTML = '';
    return;
  }

  // 2. Base layout
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

  wrapper.append(left, right);
  block.appendChild(wrapper);

  // 3. Build accordion items
  items.forEach((item, index) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    if (index === 0) accordionItem.classList.add('active');

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
    bodyDiv.innerHTML = item.body || '';

    if (item.link && item.linkText) {
      const cta = document.createElement('a');
      cta.className = 'accordion-cta';
      cta.href = item.link;
      cta.textContent = item.linkText;
      bodyDiv.appendChild(cta);
    }

    // Click behavior: open item + swap image
    headerBtn.addEventListener('click', () => {
      [...left.querySelectorAll('.accordion-item')].forEach((el) => {
        el.classList.remove('active');
      });
      accordionItem.classList.add('active');

      if (item.image) {
        img.src = item.image;
        img.alt = item.imageAlt || '';
        img.style.display = '';
      } else {
        img.removeAttribute('src');
        img.alt = '';
        img.style.display = 'none';
      }
    });

    accordionItem.append(headerBtn, bodyDiv);
    left.appendChild(accordionItem);
  });

  // 4. Initialize image with first item
  const first = items[0];
  if (first && first.image) {
    img.src = first.image;
    img.alt = first.imageAlt || '';
  } else {
    img.style.display = 'none';
  }
}
