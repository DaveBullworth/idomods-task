// Hero lamps (PLAN.md §3.3, comments spec 03): click / Enter / Space toggles a
// lamp's light. The visuals are CSS (css/lamps.css); this script only keeps
// the state:
// - aria-pressed on the button, .light--on on its light group;
// - .hero--lit (any lamp on) and .hero--lit-1/2/3 on the hero for the light
//   layer, the room dim and the headline easter egg (at 3);
// - the first-visit hint: shown until the first click, remembered in
//   localStorage (try/catch: blocked storage just means it shows again).
(function () {
  'use strict';

  var HINT_KEY = 'sollux:lamp-hint-seen';

  function hintSeen() {
    try {
      return window.localStorage.getItem(HINT_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberHint() {
    try {
      window.localStorage.setItem(HINT_KEY, '1');
    } catch (e) {
      // storage blocked: nothing to remember
    }
  }

  function init() {
    var hero = document.querySelector('[data-slider]');
    if (!hero) return;
    var lamps = hero.querySelectorAll('[data-lamp]');
    var lights = hero.querySelectorAll('[data-light]');
    var hint = hero.querySelector('[data-lamp-hint]');

    if (hint && !hintSeen()) hint.hidden = false;

    function updateRoom() {
      var count = 0;
      Array.prototype.forEach.call(lamps, function (lamp) {
        if (lamp.getAttribute('aria-pressed') === 'true') count++;
      });
      hero.classList.toggle('hero--lit', count > 0);
      for (var n = 1; n <= 3; n++) hero.classList.toggle('hero--lit-' + n, count === n);
    }

    Array.prototype.forEach.call(lamps, function (lamp, i) {
      lamp.addEventListener('click', function () {
        var on = lamp.getAttribute('aria-pressed') !== 'true';
        lamp.setAttribute('aria-pressed', String(on));
        if (lights[i]) lights[i].classList.toggle('light--on', on);
        updateRoom();
        if (hint && !hint.hidden) {
          hint.hidden = true;
          rememberHint();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
