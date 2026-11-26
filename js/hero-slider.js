// Hero slider (PLAN.md §3.4, comments spec 04).
// - Autoplay every --slide-interval (3 s); the crossfade and zoom are CSS
//   transitions on the class change (css/hero.css).
// - The progress bar is driven from the same clock, so bar and slide change
//   never drift apart. Timing uses requestAnimationFrame + performance.now,
//   which Playwright's page.clock controls.
// - Pauses while a control is hovered, while keyboard focus is inside the
//   hero, while the tab is hidden and while the hero is off-screen.
// - Pause/play toggle next to the progress bar (WCAG 2.2.2).
// - Reduced motion: no autoplay (manual changes still crossfade).
(function () {
  'use strict';

  var SWIPE_MIN = 50; // px

  function parseTime(value) {
    var text = String(value).trim();
    var n = parseFloat(text);
    if (isNaN(n)) return 0;
    return /ms$/.test(text) ? n : n * 1000;
  }

  function init() {
    var root = document.querySelector('[data-slider]');
    if (!root) return;

    var slides = root.querySelectorAll('[data-slide]');
    var dots = root.querySelectorAll('[data-slider-dot]');
    var controls = root.querySelectorAll(
      '[data-slider-prev], [data-slider-next], [data-slider-progress]',
    );
    if (slides.length < 2) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var interval = parseTime(getComputedStyle(root).getPropertyValue('--slide-interval')) || 3000;

    var index = 0;
    var elapsed = 0;
    var last = null;
    var frame = 0;
    var pauseButton = root.querySelector('[data-slider-pause]');
    var paused = { hover: false, focus: false, hidden: document.hidden, offscreen: false };
    // Explicit choice from the pause/play toggle: null (not used), 'paused' or
    // 'playing'. Once used it wins over the automatic hover/focus pauses, so
    // pressing "play" with the keyboard (focus still inside) really plays.
    var userChoice = null;

    function autoplay() {
      if (reduce.matches || paused.hidden || paused.offscreen) return false;
      if (userChoice) return userChoice === 'playing';
      return !paused.hover && !paused.focus;
    }

    function renderProgress() {
      Array.prototype.forEach.call(dots, function (dot, i) {
        var fill = dot.firstElementChild;
        if (!fill) return;
        // Inline transform only while autoplay is possible; otherwise the CSS
        // default applies (active bar full, others empty).
        fill.style.transform =
          i === index && !reduce.matches ? 'scaleX(' + Math.min(elapsed / interval, 1) + ')' : '';
      });
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      elapsed = 0;
      Array.prototype.forEach.call(slides, function (slide, i) {
        var active = i === index;
        slide.classList.toggle('hero__slide--active', active);
        if (active) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
      });
      Array.prototype.forEach.call(dots, function (dot, i) {
        var active = i === index;
        dot.classList.toggle('hero__dot--active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      renderProgress();
    }

    function tick(now) {
      frame = 0;
      // Clamp long gaps (throttled frames) so the bar never skips ahead.
      if (last !== null) elapsed += Math.min(now - last, 100);
      last = now;
      if (elapsed >= interval) show(index + 1);
      else renderProgress();
      update();
    }

    function update() {
      if (autoplay()) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        last = null;
        renderProgress();
      }
    }

    function go(step) {
      show(index + step);
      update();
    }

    root.querySelector('[data-slider-prev]').addEventListener('click', function () {
      go(-1);
    });
    root.querySelector('[data-slider-next]').addEventListener('click', function () {
      go(1);
    });
    Array.prototype.forEach.call(dots, function (dot, i) {
      dot.addEventListener('click', function () {
        if (i !== index) go(i - index);
      });
    });

    // Keyboard: arrow keys while focus is inside the hero.
    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
    });

    // Pause on hover over the controls (mouse only; touch has no hover).
    Array.prototype.forEach.call(controls, function (el) {
      el.addEventListener('pointerenter', function (event) {
        if (event.pointerType !== 'mouse') return;
        paused.hover = true;
        update();
      });
      el.addEventListener('pointerleave', function (event) {
        if (event.pointerType !== 'mouse') return;
        paused.hover = false;
        update();
      });
    });

    // Pause while keyboard focus is inside (mouse clicks don't match :focus-visible).
    root.addEventListener('focusin', function (event) {
      paused.focus = event.target.matches(':focus-visible');
      update();
    });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) {
        paused.focus = false;
        update();
      }
    });

    document.addEventListener('visibilitychange', function () {
      paused.hidden = document.hidden;
      update();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        paused.offscreen = !entries[entries.length - 1].isIntersecting;
        update();
      }).observe(root);
    }

    // Pause/play toggle (WCAG 2.2.2). Hidden under reduced motion, where
    // there is no autoplay to pause.
    function syncPauseButton() {
      if (!pauseButton) return;
      pauseButton.hidden = reduce.matches;
      pauseButton.setAttribute('aria-pressed', String(userChoice === 'paused'));
    }

    if (pauseButton) {
      pauseButton.addEventListener('click', function () {
        userChoice = userChoice === 'paused' ? 'playing' : 'paused';
        syncPauseButton();
        update();
      });
    }

    reduce.addEventListener('change', function () {
      syncPauseButton();
      update();
    });
    syncPauseButton();

    // Touch swipe (the arrows are hidden below 1024 px).
    var start = null;
    root.addEventListener('pointerdown', function (event) {
      start = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
    });
    root.addEventListener('pointerup', function (event) {
      if (!start) return;
      var dx = event.clientX - start.x;
      var dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    });
    root.addEventListener('pointercancel', function () {
      start = null;
    });

    show(0);
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
