// Pill groups get one shared highlight that glides to the selected option instead of jumping.
(() => {
  const groups = [
    ['.command-bar .collection-switch', 'button', 'aria-pressed'],
    ['.maturity-navigation', 'button', 'aria-pressed'],
    ['.inspector .cx-tabs', 'button', 'aria-current'],
  ];
  function attach(group, selector, attribute) {
    const glider = document.createElement('span');
    glider.className = 'tab-glider'; glider.setAttribute('aria-hidden', 'true');
    group.classList.add('has-glider'); group.prepend(glider);
    let placed = false, frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = [...group.querySelectorAll(selector)].find(button => button.getAttribute(attribute) === 'true' && button.offsetParent);
        if (!active) { glider.style.opacity = '0'; placed = false; return; }
        const box = group.getBoundingClientRect(), target = active.getBoundingClientRect();
        const x = target.left - box.left - group.clientLeft + group.scrollLeft;
        const y = target.top - box.top - group.clientTop + group.scrollTop;
        // First placement (or reappearing after being hidden) snaps into position; later changes glide.
        if (!placed) glider.style.transition = 'none';
        glider.style.width = `${target.width}px`; glider.style.height = `${target.height}px`;
        glider.style.transform = `translate(${x}px, ${y}px)`;
        glider.style.opacity = '1';
        if (!placed) { void glider.offsetWidth; glider.style.transition = ''; placed = true; }
      });
    }
    new MutationObserver(update).observe(group, { subtree: true, attributes: true, attributeFilter: [attribute] });
    new ResizeObserver(update).observe(group);
    group.querySelectorAll(selector).forEach(button => new ResizeObserver(update).observe(button));
    update();
  }
  function init() {
    groups.forEach(([groupSelector, selector, attribute]) => document.querySelectorAll(groupSelector).forEach(group => attach(group, selector, attribute)));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
