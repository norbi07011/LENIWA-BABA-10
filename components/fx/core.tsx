import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clamp, getScroll, isTouch, onScroll, prefersReducedMotion } from '../../lib/motion';

/* ------------------------------------------------------------------ */
/* useInView — Intersection Observer, fires once                        */
/* ------------------------------------------------------------------ */
export function useInView<T extends Element>(opts: { once?: boolean; rootMargin?: string; threshold?: number } = {}) {
  const { once = true, rootMargin = '0px 0px -12% 0px', threshold = 0.12 } = opts;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);
  return [ref, inView] as const;
}

/** Calls fn on every scroll frame (no React re-render). */
export function useScrollFrame(fn: Parameters<typeof onScroll>[0], deps: React.DependencyList = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => onScroll((s) => fnRef.current(s)), deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ------------------------------------------------------------------ */
/* Reveal on scroll                                                     */
/* ------------------------------------------------------------------ */
type RevealKind = 'up' | 'blur' | '3d' | 'left' | 'right';
export const Reveal: React.FC<{
  as?: keyof React.JSX.IntrinsicElements;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
}> = ({ as = 'div', kind = 'up', delay = 0, className = '', style, children, id }) => {
  const [ref, inView] = useInView<HTMLElement>();
  const Tag = as as any;
  return (
    <Tag
      id={id}
      ref={ref}
      className={`reveal reveal--${kind} ${inView ? 'is-in' : ''} ${className}`}
      style={{ ...style, ['--d' as any]: `${delay}s` }}
    >
      {children}
    </Tag>
  );
};

/* ------------------------------------------------------------------ */
/* Split text — staggered letter reveal (kinetic typography)            */
/* ------------------------------------------------------------------ */
export const SplitText: React.FC<{
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  /** When set, the reveal waits for this flag instead of the element scrolling into view. */
  immediate?: boolean;
}> = ({ text, as = 'span', className = '', delay = 0, immediate }) => {
  const [ref, inView] = useInView<HTMLElement>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!immediate) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [immediate]);
  const on = immediate === undefined ? inView : immediate && ready;
  const Tag = as as any;
  let i = 0;
  const words = text.split(' ');
  return (
    <Tag ref={ref} className={`split ${on ? 'is-in' : ''} ${className}`} aria-label={text} style={{ ['--base' as any]: `${delay}s` }}>
      {words.map((w, wi) => (
        <React.Fragment key={wi}>
          <span className="w" aria-hidden="true">
            {Array.from(w).map((ch, ci) => (
              <span className="c" key={ci} style={{ ['--i' as any]: i++ }}>
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  );
};

/* ------------------------------------------------------------------ */
/* Magnetic — element pulls toward the cursor                           */
/* ------------------------------------------------------------------ */
export const Magnetic: React.FC<{ strength?: number; className?: string; children: React.ReactNode }> = ({
  strength = 0.35,
  className = '',
  children,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.classList.add('is-active');
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      if (inner) {
        inner.style.transform = `translate3d(${x * strength * 0.35}px, ${y * strength * 0.35}px, 0)`;
        inner.style.setProperty('--mx', `${e.clientX - r.left}px`);
        inner.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    };
    const leave = () => {
      el.classList.remove('is-active');
      el.style.transform = '';
      if (inner) inner.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Tilt card with glare                                                 */
/* ------------------------------------------------------------------ */
export const TiltCard: React.FC<{ max?: number; className?: string; children: React.ReactNode }> = ({
  max = 10,
  className = '',
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.add('is-active');
        el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
        el.style.setProperty('--gx', `${px * 100}%`);
        el.style.setProperty('--gy', `${py * 100}%`);
        el.style.setProperty('--ga', '1');
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.classList.remove('is-active');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--ga', '0');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max]);
  return (
    <div ref={ref} className={`tilt ${className}`}>
      <div className="tilt-inner">
        {children}
        <span className="tilt-glare" aria-hidden="true" />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scroll-velocity marquee                                              */
/* ------------------------------------------------------------------ */
export const VelocityMarquee: React.FC<{ items: string[]; speed?: number }> = ({ items, speed = 0.6 }) => {
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    const g = group.current;
    if (!el || !g) return;
    const reduced = prefersReducedMotion();
    let x = 0;
    let skew = 0;
    let boost = 0;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const v = getScroll().v;
      const dir = getScroll().dir;
      boost += (Math.abs(v) * 0.9 - boost) * 0.12;
      skew += (clamp(v * 0.6, -12, 12) - skew) * 0.12;
      const step = reduced ? 0 : (speed + boost) * dir;
      const w = g.offsetWidth;
      x -= step;
      if (w > 0) {
        if (x <= -w) x += w;
        if (x > 0) x -= w;
      }
      el.style.transform = `translate3d(${x}px,0,0) skewX(${reduced ? 0 : -skew}deg)`;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed]);
  const Group = (props: { refEl?: React.Ref<HTMLDivElement>; hidden?: boolean }) => (
    <div ref={props.refEl} style={{ display: 'flex' }} aria-hidden={props.hidden || undefined}>
      {items.map((it, i) => (
        <span className="marquee-item" key={i}>
          {it}
          <svg className="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c.6 5.6 4.4 9.6 12 12-7.6 2.4-11.4 6.4-12 12-.6-5.6-4.4-9.6-12-12C7.6 9.6 11.4 5.6 12 0z" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee">
      <div ref={track} className="marquee-track">
        <Group refEl={group} />
        <Group hidden />
        <Group hidden />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Count-up on scroll                                                   */
/* ------------------------------------------------------------------ */
export const CountUp: React.FC<{ to: number; decimals?: number; duration?: number; className?: string }> = ({
  to,
  decimals = 0,
  duration = 1800,
  className,
}) => {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setVal(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = clamp((t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 4);
      setVal(to * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString(document.documentElement.lang || 'nl', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Rolling number — digits roll to the new value                        */
/* ------------------------------------------------------------------ */
export const RollingNumber: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const digits = String(value).split('');
  return (
    <span className={`roll ${className}`} aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="roll-col" style={{ transform: `translateY(${-Number(d) * 1.1}em)` }} aria-hidden="true">
          {Array.from({ length: 10 }, (_, n) => (
            <span key={n}>{n}</span>
          ))}
        </span>
      ))}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Scroll progress bar                                                  */
/* ------------------------------------------------------------------ */
export const ScrollProgressBar: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame((s) => {
    if (ref.current) ref.current.style.transform = `scaleX(${s.p})`;
  });
  return <div ref={ref} className="progress-bar" aria-hidden="true" />;
};

/* ------------------------------------------------------------------ */
/* Plate (round dish cutout)                                            */
/* ------------------------------------------------------------------ */
export const Plate: React.FC<{ src: string; alt?: string; className?: string; children?: React.ReactNode }> = ({
  src,
  alt = '',
  className = '',
  children,
}) => (
  <div className={`plate ${className}`}>
    <img src={src} alt={alt} loading="lazy" draggable={false} />
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Zoom lens / magnifier                                                */
/* ------------------------------------------------------------------ */
export const ZoomLens: React.FC<{ src: string; alt: string; zoom?: number; hint?: string }> = ({ src, alt, zoom = 2.4, hint }) => {
  const box = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const b = box.current;
    const l = lens.current;
    if (!b || !l) return;
    const r = b.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const size = l.offsetWidth / 2;
    l.style.left = `${x - size}px`;
    l.style.top = `${y - size}px`;
    l.style.backgroundImage = `url("${src}")`;
    l.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
    l.style.backgroundPosition = `${-(x * zoom - size)}px ${-(y * zoom - size)}px`;
  };
  return (
    <div ref={box} className="zoom" onPointerMove={move}>
      <img src={src} alt={alt} draggable={false} />
      <div ref={lens} className="zoom-lens" aria-hidden="true" />
      {hint && !isTouch() && <span className="chip zoom-hint">{hint}</span>}
    </div>
  );
};

/** Keeps a value in sync with layout before paint (for measuring). */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
