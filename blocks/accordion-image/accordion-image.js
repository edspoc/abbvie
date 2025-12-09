// blocks/accordion-image/accordion-image.js

export default async function decorate(block) {
  let items = [];

  /********************************************************************
   * PATH 1 – AEM JSON (author / publish, has data-aue-resource)
   ********************************************************************/
  const wrapper = block.closest('[data-aue-resource]');
  if (wrapper && wrapper.dataset.aueResource) {
    const urn = wrapper.dataset.aueResource; // urn:aemconnection:/content/...
    const resourcePath = urn.replace('urn:aemconnection:', '');

    console.log('[accordion-image] resourcePath:', resourcePath);

    const url = `${resourcePath}/items.1.json`;
    try {
      console.log('[accordion-image] fetching:', url);
      const res = await fetch(url);

      if (!res.ok) {
        console.warn('[accordion-image] items.1.json failed:', res.status);
      } else {
        const raw = await res.json();
        console.log('[accordion-image] raw items json:', raw);

        // Only take item0, item1, … (ignore jcr:primaryType etc.)
        items = Object.keys(raw)
          .filter((key) => key.startsWith('item'))
          .sort((a, b) => {
            const ia = parseInt(a.replace('item', ''), 10);
            const ib = parseInt(b.replace('item', ''), 10);
            return ia - ib;
          })
          .map((key) => raw[key]);
      }
    } catch (e) {
      console.error('[accordion-image] error fetching items.1.json', e);
    }
  } else {
    /********************************************************************
     * PATH 2 – HTML fallback (EDS live link, no data-aue-resource)
     ********************************************************************/
    console.warn('[accordion-image] no data-aue-resource, using HTML fallback');

    // Expect rows like:
    // <div>
    //   <div>Title</div>
    //   <div>Body (rich text)</div>
    //   <div><a href="...">CTA text</a></div>
    //   <div><img src="..." alt="..."></div>
    // </div>
    const rows = [...block.children].filter((el) => el.tagName === 'DIV');

    items = rows
      .map((row) => {
        const cols = row.querySelectorAll(':scope > div');
        if (!cols.length) return null;

        const title = cols[0]?.textContent.trim() || '';
        const body = cols[1]?.innerHTML.trim() || '';

        const linkEl = cols[2]?.querySelector('a');
        const link = linkEl?.getAttribute('href') || '';
        const linkText = linkEl?.textContent.trim() || '';

        const imgEl = cols[3]?.querySelector('img');
        const image = imgEl?.getAttribute('src') || '';
        const imageAlt = imgEl?.getAttribute('alt') || '';

        // Ignore totally empty rows
        if (!title && !body) return null;

        return { title, body, link, linkText, image, imageAlt };
      })
      .filter(Boolean);

    console.log('[accordion-image] items from HTML fallback:', items);
  }

  if (!items.length) {
    console.warn('[accordion-image] no items to render');
    return;
  }

  /********************************************************************
   * BUILD 50 / 50 LAYOUT
   ********************************************************************/
  block.innerHTML = '';

  const container = document.createElement('div');
  container.classList.add('accordion-image-50-50');

  const leftCol = document.createElement('div');
  leftCol.classList.add('accordion-left');

  const rightCol = document.createElement('div');
  rightCol.classList.add('accordion-right');

  const imgEl = document.createElement('img');
  imgEl.classList.add('accordion-image');
  rightCol.appendChild(imgEl);

  items.forEach((item, index) => {
    const accItem = document.createElement('div');
    accItem.classList.add('accordion-item');
    if (index === 0) accItem.classList.add('active');

    const header = document.createElement('button');
    header.type = 'button';
    header.classList.add('accordion-header');

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('accordion-title');
    titleSpan.textContent = item.title || '';

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('accordion-icon');
    iconSpan.textContent = '▾';

    header.appendChild(titleSpan);
    header.appendChild(iconSpan);

    const body = document.createElement('div');
    body.classList.add('accordion-body');
    if (item.body) body.innerHTML = item.body;

    if (item.link && item.linkText) {
      const cta = document.createElement('a');
      cta.href = item.link;
      cta.textContent = item.linkText;
      cta.classList.add('accordion-cta');
      body.appendChild(cta);
    }

    header.addEventListener('click', () => {
      // remove active from siblings
      leftCol.querySelectorAll('.accordion-item').forEach((el) => {
        el.classList.remove('active');
      });
      accItem.classList.add('active');

      // swap image on the right
      if (item.image) {
        imgEl.src = item.image;
        imgEl.alt = item.imageAlt || '';
      } else {
        imgEl.removeAttribute('src');
        imgEl.removeAttribute('alt');
      }
    });

    accItem.appendChild(header);
    accItem.appendChild(body);
    leftCol.appendChild(accItem);

    // initial image (first item)
    if (index === 0 && item.image) {
      imgEl.src = item.image;
      imgEl.alt = item.imageAlt || '';
    }
  });

  container.appendChild(leftCol);
  container.appendChild(rightCol);
  block.appendChild(container);
}
