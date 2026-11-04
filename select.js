// Styled dropdowns: replaces the native popup of every <select data-ui-select>
// (and the index filters) with an accessible listbox, while the hidden native
// <select> stays the source of truth, so existing change listeners keep working.
(() => {
  'use strict';
  const proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  let uid = 0;

  function enhance(select) {
    if (select.dataset.enhanced) return;
    select.dataset.enhanced = 'true';
    const id = `ui-select-${++uid}`;
    const host = document.createElement('div');
    host.className = 'ui-select';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ui-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `${id}-list`);
    const value = document.createElement('span');
    value.className = 'ui-select-value';
    trigger.append(value, window.icon ? window.icon('chevron-down', 'ui-select-chevron') : '');
    const list = document.createElement('ul');
    list.className = 'ui-select-list';
    list.id = `${id}-list`;
    list.setAttribute('role', 'listbox');
    list.tabIndex = -1;
    list.hidden = true;
    select.before(host);
    host.append(trigger, list, select);
    select.classList.add('ui-select-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    const labelText = (select.closest('label')?.querySelector('span')?.textContent || '').trim();
    if (labelText) list.setAttribute('aria-label', labelText);

    let active = -1;
    const options = () => [...select.options];

    function refresh() {
      const current = select.options[select.selectedIndex];
      value.textContent = current ? current.textContent : '';
      trigger.setAttribute('aria-label', labelText ? `${labelText}: ${value.textContent}` : value.textContent);
    }
    function build() {
      list.replaceChildren(...options().map((option, index) => {
        const item = document.createElement('li');
        item.id = `${id}-opt-${index}`;
        item.className = 'ui-select-option';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(index === select.selectedIndex));
        if (option.disabled) item.setAttribute('aria-disabled', 'true');
        const check = window.icon ? window.icon('check', 'ui-select-check') : document.createElement('span');
        const text = document.createElement('span');
        text.textContent = option.textContent;
        item.append(check, text);
        item.addEventListener('pointerenter', () => setActive(index, false));
        item.addEventListener('click', () => choose(index));
        return item;
      }));
    }
    function setActive(index, scroll = true) {
      const items = list.children;
      if (!items.length) return;
      active = Math.max(0, Math.min(items.length - 1, index));
      [...items].forEach((item, i) => item.classList.toggle('is-active', i === active));
      list.setAttribute('aria-activedescendant', items[active].id);
      if (scroll) items[active].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      if (!list.hidden) return;
      document.querySelectorAll('.ui-select.is-open').forEach(other => other !== host && other.dispatchEvent(new Event('ui-close')));
      build();
      list.hidden = false;
      host.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      setActive(Math.max(0, select.selectedIndex));
      list.focus({ preventScroll: true });
    }
    function close(focusTrigger = true) {
      if (list.hidden) return;
      list.hidden = true;
      host.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      list.removeAttribute('aria-activedescendant');
      if (focusTrigger) trigger.focus({ preventScroll: true });
    }
    function choose(index) {
      const option = select.options[index];
      if (!option || option.disabled) return;
      const changed = select.selectedIndex !== index;
      select.selectedIndex = index;
      refresh();
      close();
      if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    trigger.addEventListener('click', () => (list.hidden ? open() : close()));
    trigger.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); open(); }
    });
    let typed = '', typedAt = 0;
    list.addEventListener('keydown', event => {
      const key = event.key;
      if (key === 'ArrowDown') { event.preventDefault(); setActive(active + 1); }
      else if (key === 'ArrowUp') { event.preventDefault(); setActive(active - 1); }
      else if (key === 'Home') { event.preventDefault(); setActive(0); }
      else if (key === 'End') { event.preventDefault(); setActive(list.children.length - 1); }
      else if (key === 'Enter' || key === ' ') { event.preventDefault(); choose(active); }
      else if (key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      else if (key === 'Tab') { close(false); }
      else if (key.length === 1 && /\S/.test(key)) {
        const now = Date.now();
        typed = now - typedAt > 700 ? key.toLowerCase() : typed + key.toLowerCase();
        typedAt = now;
        const match = options().findIndex(option => option.textContent.trim().toLowerCase().startsWith(typed));
        if (match >= 0) setActive(match);
      }
    });
    list.addEventListener('focusout', event => { if (!host.contains(event.relatedTarget)) close(false); });
    host.addEventListener('ui-close', () => close(false));
    document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(false); });

    // Keep the label in sync when code sets .value or options change.
    Object.defineProperty(select, 'value', {
      configurable: true,
      get() { return proto.get.call(this); },
      set(next) { proto.set.call(this, next); refresh(); },
    });
    select.addEventListener('change', refresh);
    new MutationObserver(refresh).observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected'] });
    refresh();
  }

  function init() { document.querySelectorAll('.browse-filters select, select[data-ui-select]').forEach(enhance); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.enhanceSelect = enhance;
})();
