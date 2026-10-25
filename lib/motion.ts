import Lenis from 'lenis';
import { flushSync } from 'react-dom';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

export interface ScrollState {
  y: number;        // scroll position in px
  v: number;        // velocity (px per frame, signed)
  p: number;        // whole-page progress 0..1
  dir: 1 | -1;      // last direction
}

type Sub = (s: ScrollState) => void;

const state: ScrollState = { y: 0, v: 0, p: 0, dir: 1 };
const subs = new Set<Sub>();
let lenis: Lenis | null = null;
let started = false;

const emit = () => subs.forEach((f) => f(state));

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Starts smooth (inertia) scrolling with Lenis and one shared rAF loop. */
export function initSmoothScroll() {
  if (started || typeof window === 'undefined') return;
  started = true;

  const reduced = prefersReducedMotion();
  let lastY = window.scrollY;

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', (l: Lenis) => {
      state.v = l.velocity;
      state.y = l.scroll;
      state.p = l.limit > 0 ? l.scroll / l.limit : 0;
      if (Math.abs(l.velocity) > 0.1) state.dir = l.velocity > 0 ? 1 : -1;
      emit();
    });
  }

  const loop = (time: number) => {
    if (lenis) {
      lenis.raf(time);
    } else {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      state.v = y - lastY;
      if (state.v !== 0) state.dir = state.v > 0 ? 1 : -1;
      lastY = y;
      state.y = y;
      state.p = max > 0 ? y / max : 0;
      emit();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Smooth in-page anchor links (#menu, #reservation, …)
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
  });

  window.addEventListener('resize', () => lenis?.resize());
}

export function scrollToEl(el: HTMLElement | string, offset = -70) {
  const target = typeof el === 'string' ? document.getElementById(el) : el;
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.6 });
  else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function lockScroll(lock: boolean) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}

/** Subscribe to every scroll frame. Returns an unsubscribe function. */
export function onScroll(fn: Sub): () => void {
  subs.add(fn);
  fn(state);
  return () => {
    subs.delete(fn);
  };
}

export const getScroll = () => state;

/** Progress of an element through the viewport.
 *  mode 'pin': 0 when the element top hits the viewport top, 1 when its bottom hits the viewport bottom.
 *  mode 'through': 0 when the top enters at the bottom, 1 when the bottom leaves at the top. */
export function elementProgress(el: HTMLElement, mode: 'pin' | 'through' = 'pin') {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (mode === 'pin') return clamp(-r.top / Math.max(1, r.height - vh));
  return clamp((vh - r.top) / (r.height + vh));
}

/** Runs a state update inside the View Transitions API when available. */
export function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  doc.startViewTransition(() => {
    flushSync(update);
  });
}

/** Shakes the page (or the given element) once. */
export function screenShake(target?: HTMLElement | null) {
  if (prefersReducedMotion()) return;
  const el = target ?? document.getElementById('shell');
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  window.setTimeout(() => el.classList.remove('shake'), 600);
}

/** Resolves a public asset path relative to the page, so the build works under any base path. */
export const asset = (p: string) => `./${p.replace(/^\.?\//, '')}`;
export const img = (name: string) => asset(`images/${name}`);
