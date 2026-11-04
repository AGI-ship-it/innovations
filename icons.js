// Lucide icon helpers shared by every script. Icons are decorative; labels carry the meaning.
(() => {
  const pascal = name => name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
  window.icon = (name, className = '') => {
    const node = window.lucide?.icons?.[pascal(name)];
    if (!node) return document.createTextNode('');
    const svg = window.lucide.createElement(node);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (className) svg.classList.add(...className.split(' '));
    return svg;
  };
  // Replace a node's contents with text plus an icon before ('lead') or after ('trail') it.
  window.setIconLabel = (node, label, name, side = 'trail') => {
    const parts = [document.createTextNode(label)];
    side === 'lead' ? parts.unshift(window.icon(name, 'icon-lead')) : parts.push(window.icon(name, 'icon-trail'));
    node.replaceChildren(...parts);
    return node;
  };
  const render = () => window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true', focusable: 'false' } });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', render) : render();
})();
