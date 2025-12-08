export default function decorate(block) {
  // IMPORTANT: do NOT clear block yet
  const rows = Array.from(block.children);

  if (!rows.length) return;

  // build wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-image-50-50';

  const left = document.createElement('div');
  left.className = 'accordion-left';

  const right = document.createElement('div');
  right.className = 'accordion-right';

  const img = document.createElement('img');
  img.className = 'accordion-image';
  right.appendChild(img);

  rows.forEach((row, index) => {
    const cols = Array.from(row.children);

    const title = cols[0]?.textContent?.trim();
    const body = cols[1]?.innerHTML;
    const link = cols[2]?.textContent?.trim();
    const linkText = cols[3]?.textContent?.trim();
    const image = cols[4]?.querySelector('img')?.src;
    const alt = cols[5]?.textContent?.trim() || '';

    const item = document.createElement('div');
    item.className = 'accordion-item';

    item.innerHTML = `
      <button class="accordion-header">
        <span class="accordion-title">${title}</span>
        <span class="accordion-icon">▾</span>
      </button>
      <div class="accordion-body">
        ${body || ''}
        ${
          link
            ? `<a class="accordion-link" href="${link}">
                ${linkText || 'Learn more'} →
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
        img.alt = alt;
      }
    });

    // default open
    if (index === 0 && image) {
      item.classList.add('active');
      img.src = image;
      img.alt = alt;
    }

    left.appendChild(item);
  });

  // NOW clear block (after reading rows)
  block.innerHTML = '';
  wrapper.append(left, right);
  block.append(wrapper);
}
