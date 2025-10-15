// Eyebrow bar: renders a small top strip with a richtext message.
// Strict EDS: keep UE-authored nodes, provide a clear binding target.

export default function decorate(block) {
  // Wrap without destroying UE placeholders
  const wrap = document.createElement('div');
  wrap.className = 'eyebrow-bar';
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', 'Site notice');

  // Move existing children (if any) into wrapper
  while (block.firstChild) wrap.appendChild(block.firstChild);
  block.appendChild(wrap);

  // Find or create the message target
  let msg = wrap.querySelector('[data-aue-prop="message"]');
  if (!msg) {
    msg = document.createElement('div');
    msg.setAttribute('data-aue-prop', 'message');     // must match model field "name"
    msg.setAttribute('data-aue-type', 'richtext');    // richtext authoring
    msg.setAttribute('data-aue-label', 'Eyebrow Message');
    wrap.appendChild(msg);
  }
  msg.classList.add('eyebrow-bar__message');

  // Optional container for max-width layouts
  if (!wrap.querySelector('.eyebrow-bar__inner')) {
    const inner = document.createElement('div');
    inner.className = 'eyebrow-bar__inner';
    // move message into inner
    inner.appendChild(msg);
    wrap.appendChild(inner);
  }
}
