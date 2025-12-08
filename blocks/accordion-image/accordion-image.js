export default async function decorate(block) {
  const wrapper = block.closest('[data-aue-resource]');
  if (!wrapper) {
    console.error('[accordion-image] No aue resource found');
    return;
  }

  const resourcePath = wrapper.dataset.aueResource.replace('urn:aemconnection:', '');
  console.log('[accordion-image] resource path:', resourcePath);

  // ✅ THIS is the correct endpoint
  const itemsUrl = `${resourcePath}/items.1.json`;
  console.log('[accordion-image] fetching:', itemsUrl);

  const res = await fetch(itemsUrl);
  if (!res.ok) {
    console.error('[accordion-image] items load failed', res.status);
    return;
  }

  const raw = await res.json();
  console.log('[accordion-image] raw items JSON:', raw);

  // convert { item0:{}, item1:{} } → array
  const items = Object.values(raw || {});
  if (!items.length) {
    console.warn('[accordion-image] No accordion items found');
    return;
  }

  block.innerHTML = `
    <div class="accordion-image-50-50">
      <div class="accordion-left"></div>
      <div class="accordion-right">
        <img class="accordion-image" />
      </div>
    </div>
  `;

  const left = block.querySelector('.accordion-left');
  const img = block.querySelector('.accordion-image');

  items.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = `accordion-item ${index === 0 ? 'active' : ''}`;

    el.innerHTML = `
      <button class="accordion-header">
        <span class="accordion-title">${item.title ?? ''}</span>
        <span class="accordion-icon">▾</span>
      </button>
      <div class="accordion-body">
        ${item.body ?? ''}
        ${
          item.link && item.linkText
            ? `<a class="accordion-cta" href="${item.link}">${item.linkText}</a>`
            : ''
        }
      </div>
    `;

    el.querySelector('.accordion-header').addEventListener('click', () => {
      block.querySelectorAll('.accordion-item').forEach(a => a.classList.remove('active'));
      el.classList.add('active');
      if (item.image) {
        img.src = item.image;
        img.alt = item.imageAlt || '';
      }
    });

    if (index === 0 && item.image) {
      img.src = item.image;
      img.alt = item.imageAlt || '';
    }

    left.appendChild(el);
  });
}
