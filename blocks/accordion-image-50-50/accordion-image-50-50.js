<script>
  (function () {
    function initAccordionWithImage(root) {
      if (!root) return;

      const items = Array.from(root.querySelectorAll('.eds-accordion__item'));
      const imageEl = root.querySelector('.eds-acc-img__image');

      if (!items.length || !imageEl) return;

      function activateItem(item) {
        const header = item.querySelector('.eds-accordion__header');
        const panel = item.querySelector('.eds-accordion__panel');

        if (!header || !panel) return;

        // Close all items
        items.forEach(function (itm) {
          const hdr = itm.querySelector('.eds-accordion__header');
          const pnl = itm.querySelector('.eds-accordion__panel');
          if (!hdr || !pnl) return;

          itm.classList.remove('is-active');
          hdr.setAttribute('aria-expanded', 'false');
          pnl.hidden = true;
        });

        // Open current item
        item.classList.add('is-active');
        header.setAttribute('aria-expanded', 'true');
        panel.hidden = false;

        // Update image from data attributes on header
        const imgSrc = header.getAttribute('data-image');
        const imgAlt = header.getAttribute('data-image-alt');

        if (imgSrc) {
          imageEl.src = imgSrc;
        }
        if (imgAlt) {
          imageEl.alt = imgAlt;
        }
      }

      // Attach click listeners
      items.forEach(function (item) {
        const header = item.querySelector('.eds-accordion__header');
        if (!header) return;

        header.addEventListener('click', function () {
          // if already active, you can decide to collapse; here we keep it open
          if (!item.classList.contains('is-active')) {
            activateItem(item);
          }
        });
      });

      // Initial state: if none active, activate the first
      var initiallyActive = items.find(function (itm) {
        return itm.classList.contains('is-active');
      });

      if (!initiallyActive) {
        activateItem(items[0]);
      } else {
        // Ensure image matches the active item on load
        activateItem(initiallyActive);
      }
    }

    // Init all components on page
    document.addEventListener('DOMContentLoaded', function () {
      const components = document.querySelectorAll(
        '.eds-acc-img[data-component="accordion-with-image"]'
      );
      components.forEach(initAccordionWithImage);
    });
  })();
</script>
