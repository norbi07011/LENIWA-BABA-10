import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { HERO_IMAGES } from '../../constants';
import { Magnetic, Plate, SplitText, useScrollFrame } from '../fx/core';
import { SmokeShader } from '../fx/canvas';
import { clamp, elementProgress, img, isTouch, lerp, prefersReducedMotion } from '../../lib/motion';
import { IconArrow } from '../icons/ui';

const PLATES = [
  { src: 'Żurek śląski.jpg', x: 7, y: 16, s: 'clamp(92px, 12vw, 180px)', depth: 1.3, dx: -1, dy: -0.6, dur: 6.5 },
  { src: 'Pierogi z mięsem.jpg', x: 78, y: 12, s: 'clamp(76px, 9.5vw, 140px)', depth: 0.8, dx: 1, dy: -0.8, dur: 7.2 },
  { src: 'Rolada śląska.jpg', x: 80, y: 56, s: 'clamp(96px, 13vw, 196px)', depth: 1.5, dx: 1.1, dy: 0.5, dur: 5.8 },
  { src: 'Szarlotka na ciepło.jpg', x: 6, y: 60, s: 'clamp(80px, 10vw, 150px)', depth: 0.9, dx: -1.1, dy: 0.6, dur: 6.9 },
];

export const Hero: React.FC<{ ready: boolean }> = ({ ready }) => {
  const { t } = useAppContext();
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const rowA = useRef<HTMLSpanElement>(null);
  const rowB = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const kicker = useRef<HTMLDivElement>(null);
  const plates = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const progress = useRef(0);
  const [slide, setSlide] = useState(0);

  // Crossfading photos inside the frame
  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), 5200);
    return () => window.clearInterval(id);
  }, []);

  // Cursor-reactive scene (mouse parallax)
  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      mouse.current.tx = e.clientX / window.innerWidth - 0.5;
      mouse.current.ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const m = mouse.current;
      m.x += (m.tx - m.x) * 0.06;
      m.y += (m.ty - m.y) * 0.06;
      apply();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const apply = () => {
    const p = progress.current;
    const m = mouse.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const reduced = prefersReducedMotion();

    // Camera dolly into the frame: the arched window grows until it fills the screen
    const f = frame.current;
    if (f) {
      const fw = f.offsetWidth;
      const fh = f.offsetHeight;
      const cover = Math.max(vw / fw, vh / fh) * 1.04;
      const k = reduced ? 0 : clamp(p / 0.85);
      const e = k * k * (3 - 2 * k);
      const s = lerp(1, cover, e);
      const rTop = lerp(fw / 2, 0, e);
      const rBot = lerp(18, 0, e);
      f.style.transform = `scale(${s}) translate3d(${m.x * -12 * (1 - e)}px, ${m.y * -12 * (1 - e)}px, 0)`;
      f.style.borderRadius = `${rTop}px ${rTop}px ${rBot}px ${rBot}px / ${rTop * 1.25}px ${rTop * 1.25}px ${rBot}px ${rBot}px`;
    }
    // Title splits apart
    const split = reduced ? 0 : clamp(p / 0.6);
    if (rowA.current) rowA.current.style.transform = `translate3d(${-split * vw * 0.45 + m.x * 18}px, ${m.y * 10}px, 0)`;
    if (rowB.current) rowB.current.style.transform = `translate3d(${split * vw * 0.45 + m.x * 26}px, ${m.y * 14}px, 0)`;
    const fade = String(clamp(1 - p * 2.2));
    if (rowA.current) rowA.current.style.opacity = fade;
    if (rowB.current) rowB.current.style.opacity = fade;
    if (meta.current) meta.current.style.opacity = String(clamp(1 - p * 4));
    if (kicker.current) kicker.current.style.opacity = String(clamp(1 - p * 4));
    // Plates drift with the cursor at different depths and fly out as the camera moves in
    if (scene.current) scene.current.style.transform = `rotateX(${m.y * -6}deg) rotateY(${m.x * 8}deg)`;
    PLATES.forEach((pl, i) => {
      const el = plates.current[i];
      if (!el) return;
      const out = reduced ? 0 : clamp(p / 0.7);
      const x = m.x * 60 * pl.depth + pl.dx * out * vw * 0.35;
      const y = m.y * 40 * pl.depth + pl.dy * out * vh * 0.5;
      const z = pl.depth * 40 + out * 300;
      el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotate(${out * pl.dx * 40}deg)`;
      el.style.opacity = String(clamp(1 - out * 1.3));
    });
  };

  useScrollFrame(() => {
    if (!section.current) return;
    progress.current = elementProgress(section.current, 'pin');
    apply();
  });

  return (
    <section id="home" ref={section} className="hero" aria-label="Leniwa Baba">
      <div className="hero-stage">
        <SmokeShader />

        <div ref={frame} className="hero-frame" style={{ transformOrigin: '50% 50%' }}>
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={img(src)}
              alt=""
              className={i === slide ? 'is-on' : ''}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))}
        </div>

        <div ref={scene} className="hero-scene" aria-hidden="true">
          {PLATES.map((pl, i) => (
            <div
              key={pl.src}
              ref={(el) => { plates.current[i] = el; }}
              className="plate-float"
              style={{ left: `${pl.x}%`, top: `${pl.y}%`, ['--s' as any]: pl.s }}
            >
              <div className="bob" style={{ ['--dur' as any]: `${pl.dur}s`, ['--delay' as any]: `${-i * 1.3}s` }}>
                <Plate src={img(pl.src)} />
              </div>
            </div>
          ))}
        </div>

        <div className="hero-title">
          <div ref={kicker} className="eyebrow" style={{ marginBottom: 18 }}>
            {t('hero_kicker')}
          </div>
          <h1 className="h-display">
            <span ref={rowA} className="row">
              <SplitText text="Leniwa" immediate={ready} delay={0.1} />
            </span>
            <span ref={rowB} className="row" style={{ fontStyle: 'italic', color: 'var(--brass)' }}>
              <SplitText text="Baba" immediate={ready} delay={0.35} />
            </span>
          </h1>
        </div>

        <div ref={meta} className="hero-meta">
          <div className="wrap">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <p>{t('hero_lead')}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Magnetic>
                  <a href="#reservation" className="btn">
                    <span className="btn-label">{t('book_now')}</span>
                    <IconArrow size={18} />
                  </a>
                </Magnetic>
                <Magnetic strength={0.25}>
                  <a href="#menu" className="btn btn--ghost">
                    <span className="btn-label">{t('see_menu')}</span>
                  </a>
                </Magnetic>
              </div>
            </div>
            <span className="scroll-cue" aria-hidden="true">
              {t('scroll_hint')}
              <i />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
