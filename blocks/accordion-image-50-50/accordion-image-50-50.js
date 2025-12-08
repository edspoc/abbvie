export default function decorate(block) {
  // STEP 1: read raw rows FIRST
  const rows = Array.from(block.children);

  if (!rows.length) {
    return;
  }

  // STEP 2: create layout
  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-image-50-50';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const img = document.createElement('img');
  img.className = 'accordion-image';
  right.appendChild(img);

  // STEP 3: build accordion from DOM rows
  rows.forEach((row, index) => {
    const cols = Array.from(row.children);

    // ⬇️ THIS ORDER MUST MATCH YOUR MODEL FIELDS
    const title = cols[0]?.textContent?.trim();
    const body = cols[1]?.innerHTML;
    const link = cols[2]?.textContent?.trim();
    const linkText = cols[3]?.textContent?.trim();
    const image = cols[4]?.querySelector('img')?.src;
    const imageAlt = cols[5]?.textContent?.trim() || '';

    const item = document.createElement('div');
    item.className = 'accordion-item';

    item.innerHTML = `
      <button class="accordion-header">${title || ''}</button>
      <div class="accordion-body">
        ${body || ''}
        ${
          link
            ? `<a class="accordion-cta" href="${link}">
                 ${linkText || 'Learn more'}
               </a>`
            : ''
        }
      </div>
    `;

    item.querySelector('.accordion-header').addEventListener('click', () => {
      left.querySelectorAll('.accordion-item')
        .forEach(i => i.classList.remove('active'));

      item.classList.add('active');

      if (image) {
        img.src = image;
        img.alt = imageAlt;
      }
    });

    // Default open first
    if (index === 0 && image) {
      item.classList.add('active');
      img.src = image;
      img.alt = imageAlt;
    }

    left.appendChild(item);
  });

  // STEP 4: replace block content
  block.innerHTML = '';
  wrapper.append(left, right);
  block.append(wrapper);
}
