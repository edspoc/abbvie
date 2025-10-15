// /blocks/eyebrow-bar/eyebrow-bar.js
export default function decorate(block) {
  // 1) Ensure a single root wrapper
  let root = block.querySelector(':scope > .eyebrow-bar');
  if (!root) {
    root = document.createElement('div');
    root.className = 'eyebrow-bar';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Site notice');
    while (block.firstChild) root.append(block.firstChild);
    block.append(root);
  }

  // 2) Ensure inner container
  let inner = root.querySelector(':scope > .eyebrow-bar__inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'eyebrow-bar__inner';
    root.append(inner);
  }

  // 3) Find or create the message element
  let msg =
    inner.querySelector(':scope > .eyebrow-bar__message') ||
    root.querySelector(':scope > [data-aue-prop="message"]');

  if (!msg) {
    msg = document.createElement('div');
    msg.setAttribute('data-aue-prop', 'message');
    msg.setAttribute('data-aue-type', 'richtext');
    msg.setAttribute('data-aue-label', 'Eyebrow Message');
  }
  msg.classList.add('eyebrow-bar__message');
  if (msg.parentElement !== inner) inner.append(msg);

  // 4) MOVE authored content into message (don’t duplicate)
  // Anything in root that is not the inner container is considered authored holder(s)
  [...root.children].forEach((child) => {
    if (child !== inner) {
      while (child.firstChild) msg.append(child.firstChild);
      child.remove();
    }
  });

  // 5) Optional: tidy links
  msg.querySelectorAll('a[href^="http"]').forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener';
  });
}
