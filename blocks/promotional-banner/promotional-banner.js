export default function decorate(block) {
  // --- Wrap the entire block for styling ---
  const wrap = document.createElement('div');
  wrap.className = 'promotional-banner';
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', 'Promotional Banner');

  // Move existing children into wrap
  while (block.firstChild) wrap.appendChild(block.firstChild);
  block.appendChild(wrap);

  // --- Inner container for layout ---
  let inner = wrap.querySelector('.promotional-banner__inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'promotional-banner__inner';
    // move all top-level children into inner
    while (wrap.firstChild) inner.appendChild(wrap.firstChild);
    wrap.appendChild(inner);
  }

  // --- Left Text ---
  let leftText = inner.querySelector('[data-aue-prop="leftText"]');
  if (leftText) {
    leftText.classList.add('promotional-banner__left-text');
  }

  // --- Right RTE One & Two ---
  let rightRteOne = inner.querySelector('[data-aue-prop="rightRteOne"]');
  let rightRteTwo = inner.querySelector('[data-aue-prop="rightRteTwo"]');

  if (rightRteOne || rightRteTwo) {
    const rightColumn = document.createElement('div');
    rightColumn.className = 'promotional-banner__right-column';

    if (rightRteOne) {
      rightRteOne.classList.add('promotional-banner__right-rte', 'promotional-banner__right-rte--one');
      rightColumn.appendChild(rightRteOne);
    }
    if (rightRteTwo) {
      rightRteTwo.classList.add('promotional-banner__right-rte', 'promotional-banner__right-rte--two');
      rightColumn.appendChild(rightRteTwo);
    }

    if (leftText?.parentElement) {
      inner.insertBefore(rightColumn, leftText.nextSibling);
    } else {
      inner.appendChild(rightColumn);
    }
  }

  // --- Add row classes to direct children of inner ---
  [...inner.children].forEach((child, idx) => {
    child.classList.add('promotional-banner__row', `promotional-banner__row--${idx + 1}`);
  });

  // --- Wrap rows 2 and 3 in a new right section ---
  const row2 = inner.querySelector('.promotional-banner__row--2');
  const row3 = inner.querySelector('.promotional-banner__row--3');

  if (row2 || row3) {
    const rightSection = document.createElement('div');
    rightSection.className = 'promotional-banner__right-section';

    if (row2) rightSection.appendChild(row2);
    if (row3) rightSection.appendChild(row3);

    // Insert rightSection after row 1 (or at the end if row1 is missing)
    const row1 = inner.querySelector('.promotional-banner__row--1');
    if (row1?.parentElement) {
      inner.insertBefore(rightSection, row1.nextSibling);
    } else {
      inner.appendChild(rightSection);
    }
  }

  // --- Accessibility: use left text as aria-label if present ---
  const labelText = leftText?.textContent?.trim();
  if (labelText && !wrap.getAttribute('aria-label')) {
    wrap.setAttribute('aria-label', labelText);
  }
}
