// Header: the search form is static and never submits (design/NOTES.md).
// Hover state and the burger panel are added in the interaction step.
(function () {
  'use strict';

  function init() {
    var search = document.querySelector('.header__search');
    if (!search) return;
    search.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
