(() => {
  "use strict";
  const root = document.documentElement;
  const edges = [...document.querySelectorAll('.stage .wide-edge')];
  if (!edges.length || !Element.prototype.animate) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1400px)');
  const slowSpeed = 8; // Pixels per second; labels and ticks move at the same speed.
  const fastRate = 24;
  const fastDuration = 2000;
  const easeDuration = 1600;
  const accelerateDuration = 160;
  const settleAt = accelerateDuration + fastDuration;
  const states = [];
  let frame = 0;
  let rate = 1;
  let travelDirection = 1;
  let pageHidden = false;

  const canRun = () => desktop.matches && !reduced.matches &&
    root.dataset.wide === 'on' && !root.hasAttribute('data-home-locked') && !document.hidden && !pageHidden;
  const applyRate = (next) => {
    if (Math.abs(next - rate) < 0.0001) return;
    rate = next;
    states.forEach(({ animations }) => animations.forEach(animation => animation.updatePlaybackRate(rate)));
  };
  const stopBurst = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    applyRate(1);
  };
  const smoothstep = value => value * value * (3 - 2 * value);
  const setDirection = next => {
    const direction = next < 0 ? -1 : 1;
    if (direction === travelDirection) return;
    travelDirection = direction;
    states.forEach(({ animations }) => animations.forEach(animation => {
      const duration = animation.effect.getTiming().duration;
      const phase = ((animation.currentTime || 0) % duration) / duration;
      // Mirror the loop's progress so reversing never resets its visible position.
      // Keep playback positive: a negative rate would eventually hit time zero.
      animation.effect.updateTiming({ direction: travelDirection > 0 ? 'normal' : 'reverse' });
      animation.currentTime = (1 - phase) * duration;
    }));
  };
  const pulse = (direction = travelDirection) => {
    setDirection(direction);
    if (!canRun()) return;
    cancelAnimationFrame(frame);
    const started = performance.now();
    const startRate = rate;
    const tick = now => {
      if (!canRun()) { stopBurst(); return; }
      const elapsed = now - started;
      if (elapsed < accelerateDuration) {
        applyRate(startRate + (fastRate - startRate) * smoothstep(elapsed / accelerateDuration));
      } else if (elapsed < settleAt) {
        applyRate(fastRate);
      } else if (elapsed < settleAt + easeDuration) {
        applyRate(fastRate + (1 - fastRate) * smoothstep((elapsed - settleAt) / easeDuration));
      } else {
        stopBurst();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };

  const createState = edge => {
    const marks = edge.querySelector('.we-marks');
    const rail = edge.querySelector('.we-rail i');
    const labels = [...(marks?.children || [])];
    if (!rail || labels.length < 2 || !marks.clientHeight) return null;
    const track = document.createElement('span');
    track.className = 'we-mark-track';
    const loop = document.createElement('span');
    loop.className = 'we-mark-loop';
    loop.append(...labels);
    const copy = loop.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.append(loop, copy);
    marks.append(track);
    edge.classList.add('is-rolling');
    const direction = edge.classList.contains('wide-edge-l') ? 1 : -1;
    const ticks = rail.animate(direction > 0 ? [
      { transform: 'translateY(-13px)' }, { transform: 'translateY(0)' }
    ] : [
      { transform: 'translateY(0)' }, { transform: 'translateY(-13px)' }
    ], { duration: 13 / slowSpeed * 1000, iterations: Infinity, easing: 'linear',
      direction: travelDirection > 0 ? 'normal' : 'reverse' });
    ticks.id = `edge-scale-${direction > 0 ? 'left' : 'right'}-ticks`;
    ticks.pause();
    ticks.currentTime = 0;
    const numbers = track.animate([], { duration: 1, iterations: Infinity, easing: 'linear',
      direction: travelDirection > 0 ? 'normal' : 'reverse' });
    numbers.id = `edge-scale-${direction > 0 ? 'left' : 'right'}-numbers`;
    numbers.pause();
    numbers.currentTime = 0;
    return { edge, marks, labels, direction, numbers, animations: [ticks, numbers], distance: 0 };
  };
  const measure = state => {
    const height = state.marks.clientHeight;
    if (!height) return;
    // Keep the original eight label positions, including their first/last spacing.
    const labelHeight = state.labels[0].getBoundingClientRect().height;
    const distance = (height - labelHeight) / (state.labels.length - 1) * state.labels.length;
    if (distance <= 0 || Math.abs(distance - state.distance) < 0.1) return;
    const animation = state.numbers;
    const previousDuration = animation.effect.getTiming().duration;
    const phase = ((animation.currentTime || 0) % previousDuration) / previousDuration;
    const duration = distance / slowSpeed * 1000;
    state.edge.style.setProperty('--edge-loop', `${distance}px`);
    animation.effect.setKeyframes(state.direction > 0 ? [
      { transform: `translateY(-${distance}px)` }, { transform: 'translateY(0)' }
    ] : [
      { transform: 'translateY(0)' }, { transform: `translateY(-${distance}px)` }
    ]);
    animation.effect.updateTiming({ duration });
    animation.currentTime = phase * duration;
    state.distance = distance;
  };
  const refresh = () => {
    if (!canRun()) {
      stopBurst();
      states.forEach(({ animations }) => animations.forEach(animation => animation.pause()));
      return;
    }
    edges.forEach(edge => {
      if (states.some(state => state.edge === edge)) return;
      const state = createState(edge);
      if (state) states.push(state);
    });
    states.forEach(state => {
      measure(state);
      state.animations.forEach(animation => {
        animation.updatePlaybackRate(rate);
        if (animation.playState !== 'running') animation.play();
      });
    });
  };
  window.__cesPulseEdgeScales = pulse;
  reduced.addEventListener('change', refresh);
  desktop.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pagehide', () => { pageHidden = true; refresh(); });
  window.addEventListener('pageshow', () => { pageHidden = false; refresh(); });
  window.addEventListener('ces:home-collapse', refresh);
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(refresh);
    edges.forEach(edge => observer.observe(edge));
  } else window.addEventListener('resize', refresh);
  refresh();
})();
