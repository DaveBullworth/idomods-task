// Header (PLAN.md §3.2): static search form and the burger panel below 1280 px.
// The hover state is pure CSS (css/header.css).
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';

  function init() {
    var header = document.querySelector('[data-header]');
    if (!header) return;

    // The search form is static and never submits (design/NOTES.md).
    var search = header.querySelector('[data-search]');
    if (search) {
      search.addEventListener('submit', function (event) {
        event.preventDefault();
      });
    }

    var toggle = header.querySelector('[data-menu-toggle]');
    var menu = header.querySelector('[data-menu]');
    if (!toggle || !menu) return;

    var desktop = window.matchMedia('(min-width: 1280px)');
    var isOpen = false;

    // Everything outside the header is inert while the panel is open.
    function setOutsideInert(value) {
      Array.prototype.forEach.call(document.body.children, function (el) {
        if (el === header || el.tagName === 'SCRIPT') return;
        el.inert = value;
      });
    }

    function visibleFocusables() {
      return Array.prototype.filter.call(header.querySelectorAll(FOCUSABLE), function (el) {
        return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      });
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      header.classList.add('header--open');
      toggle.setAttribute('aria-expanded', 'true');
      setOutsideInert(true);
      var first = menu.querySelector(FOCUSABLE);
      if (first) first.focus();
    }

    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      header.classList.remove('header--open');
      toggle.setAttribute('aria-expanded', 'false');
      setOutsideInert(false);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (isOpen) close(true);
      else open();
    });

    // Following a link closes the panel (all links are href="#").
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false);
    });

    document.addEventListener('keydown', function (event) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        close(true);
        return;
      }
      // Focus trap: Tab cycles through the bar and the panel.
      if (event.key !== 'Tab') return;
      var items = visibleFocusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Growing past 1280 turns the panel back into the header row.
    desktop.addEventListener('change', function (event) {
      if (event.matches) close(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
