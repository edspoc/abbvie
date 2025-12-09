import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'accordion-image';
      } else {
        div.className = 'accordion-body';
      }
    });

    ul.append(li);
  });

  // Optimize images (same as before)
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt || '',
      false,
      [{ width: '750' }]
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // ✅ ADD: accordion behavior (MINIMAL)
  const items = [...ul.querySelectorAll('li')];

  if (items.length) {
    // default active = first item (or change to last if required)
    items[0].classList.add('is-active');

    items.forEach((item) => {
      const titleRow = item.querySelector('.accordion-body:first-child');
      if (!titleRow) return;

      titleRow.addEventListener('click', () => {
        items.forEach((i) => i.classList.remove('is-active'));
        item.classList.add('is-active');
      });
    });
  }

  block.textContent = '';
  block.append(ul);
}
