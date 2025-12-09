import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const items = [];

  /* 1. Collect data from existing markup */
  [...block.querySelectorAll(':scope > ul > li')].forEach((li) => {
    const title = li.querySelector('[data-aue-prop="title"]')?.textContent;
    const body = li.querySelector('[data-aue-prop="body"]')?.innerHTML;
    const link = li.querySelector('a')?.getAttribute('href');
    const linkText = li.querySelector('a')?.textContent;
    const img = li.querySelector('picture img');

    if (title && img) {
      items.push({ title, body, link, linkText, img });
    }
  });

  block.textContent = '';

  /* 2. Create layout containers */
  const layout = document.createElement('div');
  layout.className = 'accordion-layout';

  const list = document.createElement('div');
  list.className = 'accordion-list';

  const imagePanel = document.createElement('div');
  imagePanel.className = 'accordion-image-panel';

  layout.append(list, imagePanel);
  block.append(layout);

  /* 3. Build accordion */
  items.forEach((item, index) => {
    const accItem = document.createElement('div');
    accItem.className = 'accordion-item';
    if (index === 0) accItem.classList.add('is-active');

    const header = document.createElement('button');
    header.className = 'accordion-header';
    header.textContent = item.title;

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.innerHTML = `
      ${item.body || ''}
      ${item.link ? `<a class="accordion-cta" href="${item.link}">${item.linkText || 'Read more'}</a>` : ''}
    `;

    header.addEventListener('click', () => {
      block.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('is-active'));
      accItem.classList.add('is-active');
      showImage(item);
    });

    accItem.append(header, panel);
    list.append(accItem);

    if (index === 0) {
      showImage(item);
    }
  });

  /* 4. Image switcher */
  function showImage(item) {
    imagePanel.textContent = '';
    const pic = createOptimizedPicture(item.img.src, item.img.alt || '', false, [
      { width: '1200' }
    ]);
    imagePanel.append(pic);
  }
}
