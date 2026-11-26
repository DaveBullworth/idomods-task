// Shader section (PLAN.md §3.7, comments spec 06): WebGL light bands behind
// static text.
// - Seamless 25 s loop: every time input is a periodic function of
//   phase = 2π · t / 25 s (noise drifts along a circle, bands move by one
//   wavelength), so t = 25 s renders exactly the t = 0 frame. t is kept modulo
//   25 s in JS so float precision never degrades.
// - Cheap: one full-screen triangle, 2-octave value noise, DPR capped at 1.5
//   and rendered at half that resolution, at most 60 fps, low-power context.
//   rAF only while the section is on screen and the tab is visible.
// - Fallbacks: no WebGL / lost context -> the section's CSS gradient stays
//   (the canvas never fades in). Reduced motion -> one static frame.
(function () {
  'use strict';

  var LOOP_MS = 25000;
  var MAX_DPR = 1.5;
  // The picture is soft gradients only (text is HTML), so the canvas renders
  // at half resolution and CSS scales it up: no visible difference, about a
  // quarter of the pixel work.
  var RENDER_SCALE = 0.5;
  var RESIZE_DEBOUNCE_MS = 100;
  var FRAME_MS = 1000 / 60; // slow motion: more than 60 fps only costs GPU and battery

  var VERTEX = [
    'attribute vec2 a_pos;',
    'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }',
  ].join('\n');

  var FRAGMENT = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 u_res;',
    'uniform float u_phase;',
    '',
    'float hash(vec2 p) {',
    '  vec3 p3 = fract(vec3(p.xyx) * 0.1031);',
    '  p3 += dot(p3, p3.yzx + 33.33);',
    '  return fract((p3.x + p3.y) * p3.z);',
    '}',
    '',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
    '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',
    '',
    '// two octaves only',
    'float fbm(vec2 p) {',
    '  return 0.65 * noise(p) + 0.35 * noise(p * 2.07 + 7.3);',
    '}',
    '',
    '// colour ramp sampled from screen.png: near-black -> deep olive -> gold -> brand yellow',
    'vec3 ramp(float t) {',
    '  vec3 c0 = vec3(0.063, 0.063, 0.067);', // #101011
    '  vec3 c1 = vec3(0.165, 0.141, 0.094);', // #2a2418
    '  vec3 c2 = vec3(0.373, 0.306, 0.114);', // #5f4e1d
    '  vec3 c3 = vec3(0.561, 0.443, 0.129);', // #8f7121
    '  vec3 c4 = vec3(0.949, 0.749, 0.145);', // #f2bf25
    '  vec3 c = mix(c0, c1, smoothstep(0.0, 0.25, t));',
    '  c = mix(c, c2, smoothstep(0.25, 0.5, t));',
    '  c = mix(c, c3, smoothstep(0.5, 0.75, t));',
    '  return mix(c, c4, smoothstep(0.75, 1.0, t));',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_res;', // 0..1, y up
    '  vec2 p = gl_FragCoord.xy / u_res.y;', // height-normalised
    '  vec2 loop = vec2(cos(u_phase), sin(u_phase));',
    '',
    '  // slow, periodic domain warp',
    '  vec2 q = vec2(fbm(p * 1.1 + loop * 0.45),',
    '                fbm(p * 1.1 + vec2(5.2, 1.3) - loop.yx * 0.45));',
    '',
    '  // soft diagonal bands, upper-left to lower-right on screen',
    '  float s = dot(p + q * 0.25, vec2(0.64, 0.77));',
    '  float bands = smoothstep(0.08, 0.95, 0.5 + 0.5 * sin(s * 7.5 - u_phase));',
    '',
    '  // light rises from the bottom; the top stays near black',
    '  float rise = pow(clamp(0.94 - uv.y + 0.12 * (q.y - 0.5), 0.0, 1.0), 1.15);',
    '  float glow = rise * mix(0.4, 1.15, bands) * (0.6 + 0.55 * q.x);',
    '',
    '  vec3 col = ramp(clamp(glow, 0.0, 1.0));',
    '  col += (hash(gl_FragCoord.xy + u_phase) - 0.5) / 255.0;', // dither against banding
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function setup(gl) {
    var vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return null;
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    // one triangle that covers the viewport
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    return {
      res: gl.getUniformLocation(program, 'u_res'),
      phase: gl.getUniformLocation(program, 'u_phase'),
    };
  }

  function init() {
    var root = document.querySelector('[data-shader]');
    var canvas = root && root.querySelector('[data-shader-canvas]');
    if (!canvas) return;

    var gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) return; // CSS gradient stays

    var uniforms = setup(gl);
    if (!uniforms) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var elapsed = 0;
    var last = null;
    var frame = 0;
    var visible = false;
    var lost = false;
    var resizeTimer = 0;
    var lastDraw = -Infinity;

    function draw() {
      if (lost) return;
      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform1f(uniforms.phase, (2 * Math.PI * elapsed) / LOOP_MS);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      root.classList.add('shader--ready');
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE;
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      draw();
    }

    function running() {
      return visible && !document.hidden && !reduce.matches && !lost;
    }

    function tick(now) {
      frame = 0;
      // clamp long gaps so the motion never jumps after a stall
      if (last !== null) elapsed = (elapsed + Math.min(now - last, 100)) % LOOP_MS;
      last = now;
      // 60 fps cap: time always advances, only the drawing is skipped. The
      // draw schedule moves in exact 1/60 s steps, so a 144 Hz screen averages
      // 60; the 1 ms tolerance keeps a 60 Hz screen from dropping to 30.
      var since = now - lastDraw;
      if (since >= FRAME_MS - 1) {
        lastDraw = since > 2 * FRAME_MS ? now : lastDraw + FRAME_MS;
        draw();
      }
      update();
    }

    function update() {
      if (running()) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        last = null;
      }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        update();
      }).observe(root);
    } else {
      visible = true;
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, RESIZE_DEBOUNCE_MS);
      }).observe(canvas);
    }

    document.addEventListener('visibilitychange', update);
    reduce.addEventListener('change', update);

    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      lost = true;
      root.classList.remove('shader--ready'); // back to the CSS gradient
      update();
    });
    canvas.addEventListener('webglcontextrestored', function () {
      uniforms = setup(gl);
      if (!uniforms) return;
      lost = false;
      resize();
      update();
    });

    resize();
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
