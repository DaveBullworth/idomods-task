// Hero lamp parallax (PLAN.md §3.3, the brief's second idea): the lamps drift
// slightly with the cursor, the nearest one most (data-depth on each lamp).
// - Offset: the cursor's position in the hero, from -1 to 1 on each axis,
//   clamped to the unit circle, times --lamp-parallax (12 px at a 1920 px
//   stage, scaled with the stage) times the lamp's depth.
// - Smoothed in a requestAnimationFrame loop (exponential follow), which
//   runs only while something is still moving.
// - The values go to CSS custom properties; css/lamps.css applies them with
//   `translate` (transform only). The light group moves with its lamp, and
//   the pool on the rock moves only --lamp-parallax-pool of that.
// - Mouse only (hover + fine pointer), off under reduced motion. When the
//   cursor leaves the hero the lamps ease back to rest; at rest the inline
//   properties are removed, so the hero is exactly as designed.
// - While moving, .hero--parallax promotes the moving parts to their own
//   layers (will-change), so the blurred light shapes aren't repainted every
//   frame; at rest the class goes, and so do the extra layers.
(function () {
  'use strict';

  var SMOOTH_MS = 160; // time constant of the follow
  var STAGE_REF = 1920; // --lamp-parallax is given for this stage width
  var EPSILON = 0.002;

  function init() {
    var hero = document.querySelector('[data-slider]');
    if (!hero) return;
    var lamps = hero.querySelectorAll('[data-lamp]');
    var lights = hero.querySelectorAll('[data-light]');
    if (!lamps.length) return;
    var stage = lamps[0].parentElement;

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var style = getComputedStyle(hero);
    var maxPx = parseFloat(style.getPropertyValue('--lamp-parallax')) || 12;
    var poolFollow = parseFloat(style.getPropertyValue('--lamp-parallax-pool'));
    if (isNaN(poolFollow)) poolFollow = 0.3;
    var depth = Array.prototype.map.call(lamps, function (lamp) {
      var d = parseFloat(lamp.getAttribute('data-depth'));
      return isNaN(d) ? 1 : d;
    });

    var pointer = null; // last mouse position (client px), null when outside the page
    var cur = { x: 0, y: 0 };
    var frame = 0;
    var last = null;
    var atRest = true;

    function target() {
      if (!pointer || !fine.matches || reduce.matches) return { x: 0, y: 0 };
      var r = hero.getBoundingClientRect();
      if (pointer.x < r.left || pointer.x > r.right || pointer.y < r.top || pointer.y > r.bottom) {
        return { x: 0, y: 0 };
      }
      var x = ((pointer.x - r.left) / r.width) * 2 - 1;
      var y = ((pointer.y - r.top) / r.height) * 2 - 1;
      var len = Math.sqrt(x * x + y * y);
      return len > 1 ? { x: x / len, y: y / len } : { x: x, y: y };
    }

    function render(scale) {
      if (cur.x === 0 && cur.y === 0) {
        if (atRest) return;
        atRest = true;
        hero.classList.remove('hero--parallax');
        Array.prototype.forEach.call(lamps, function (lamp) {
          lamp.style.removeProperty('--parallax');
        });
        Array.prototype.forEach.call(lights, function (light) {
          light.style.removeProperty('--parallax');
          light.style.removeProperty('--parallax-pool');
        });
        return;
      }
      if (atRest) hero.classList.add('hero--parallax');
      atRest = false;
      Array.prototype.forEach.call(lamps, function (lamp, i) {
        var dx = cur.x * scale * depth[i];
        var dy = cur.y * scale * depth[i];
        var move = dx.toFixed(2) + 'px ' + dy.toFixed(2) + 'px';
        lamp.style.setProperty('--parallax', move);
        if (lights[i]) {
          lights[i].style.setProperty('--parallax', move);
          lights[i].style.setProperty(
            '--parallax-pool',
            (dx * (poolFollow - 1)).toFixed(2) + 'px ' + (dy * (poolFollow - 1)).toFixed(2) + 'px',
          );
        }
      });
    }

    function tick(now) {
      frame = 0;
      // reads first (target, stage size), then writes (render)
      var t = target();
      var scale = (stage.getBoundingClientRect().width / STAGE_REF) * maxPx;
      var dt = last === null ? 16 : Math.min(now - last, 64);
      last = now;
      var k = 1 - Math.exp(-dt / SMOOTH_MS);
      cur.x += (t.x - cur.x) * k;
      cur.y += (t.y - cur.y) * k;
      var settled = Math.abs(t.x - cur.x) < EPSILON && Math.abs(t.y - cur.y) < EPSILON;
      if (settled) cur = t;
      render(scale);
      if (settled) last = null;
      else frame = requestAnimationFrame(tick);
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    document.addEventListener(
      'pointermove',
      function (event) {
        if (event.pointerType !== 'mouse') return;
        pointer = { x: event.clientX, y: event.clientY };
        wake();
      },
      { passive: true },
    );
    // cursor left the window
    document.addEventListener('pointerout', function (event) {
      if (event.pointerType === 'mouse' && !event.relatedTarget) {
        pointer = null;
        wake();
      }
    });
    // the hero moves under a still cursor while scrolling
    window.addEventListener('scroll', wake, { passive: true });
    fine.addEventListener('change', wake);
    reduce.addEventListener('change', wake);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
