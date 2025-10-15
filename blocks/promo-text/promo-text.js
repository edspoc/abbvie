export default function decorate(block) {
  console.group('promo-text: decorate()');

  // 1Build a wrapper without destroying children
  const wrapper = document.createElement('div');
  wrapper.className = 'promo-text';

  // Move existing children (including the UE target) into the wrapper
  while (block.firstChild) wrapper.appendChild(block.firstChild);
  block.appendChild(wrapper);

  // 2Find/normalize the UE target for the "text" field
  let textEl = wrapper.querySelector('[data-aue-prop="text"]');
  if (!textEl) {
    // If authoring left nothing, create a target so UE can bind later
    textEl = document.createElement('div');
    textEl.setAttribute('data-aue-prop', 'text');
    textEl.setAttribute('data-aue-type', 'richtext');
    textEl.setAttribute('data-aue-label', 'Text');
    wrapper.appendChild(textEl);
  }
  textEl.classList.add('promo-text__content');

  // 3Diagnostics
  console.log('After decorate (before UE binding):', block.outerHTML);
  setTimeout(() => {
    console.log('After UE binding (should contain authored text):', block.outerHTML);
  }, 800);

  console.groupEnd();
}
