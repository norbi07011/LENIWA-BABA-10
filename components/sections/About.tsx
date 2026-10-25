import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { MENU_DATA, OCCASIONS_DATA } from '../../constants';
import { CountUp, Plate, Reveal, SplitText } from '../fx/core';
import { img, isTouch, prefersReducedMotion } from '../../lib/motion';

const ORBIT = [
  'Żurek śląski.jpg',
  'Pierogi z kapustą i grzybami.jpg',
  'Rolada śląska.jpg',
  'Kremówka.jpg',
  'Bigos staropolski.jpg',
  'Kluski śląskie z okrasą.jpg',
  'Gołąbki w sosie pomidorowym.jpg',
  'Makowiec.jpg',
];

/** Dishes orbiting the restaurant's logo in 3D; the ring leans toward the cursor. */
const Orbit: React.FC = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let a = 0;
    let tiltX = 58;
    let tiltY = 0;
    let target = { x: 58, y: 0 };
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    const onMove = (e: PointerEvent) => {
      const r = wrap.current?.getBoundingClientRect();
      if (!r) return;
      const px = (e.clientX - (r.left + r.width / 2)) / r.width;
      const py = (e.clientY - (r.top + r.height / 2)) / r.height;
      target = { x: 58 - py * 26, y: px * 24 };
    };
    if (!isTouch()) window.addEventListener('pointermove', onMove);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      if (!reduced) a += 0.18;
      tiltX += (target.x - tiltX) * 0.05;
      tiltY += (target.y - tiltY) * 0.05;
      const w = wrap.current?.offsetWidth ?? 400;
      const radius = w * 0.4;
      if (ring.current) ring.current.style.transform = `rotateX(${tiltX}deg) rotateZ(${tiltY}deg)`;
      if (core.current) core.current.style.transform = `rotateZ(${-tiltY}deg) rotateX(${-tiltX}deg)`;
      items.current.forEach((el, i) => {
        if (!el) return;
        const ang = a + (360 / ORBIT.length) * i;
        // place on the ring, then undo the ring's rotation so each plate faces the viewer
        el.style.transform = `rotateZ(${ang}deg) translateX(${radius}px) rotateZ(${-ang}deg) rotateZ(${-tiltY}deg) rotateX(${-tiltX}deg)`;
        const depth = Math.sin((ang * Math.PI) / 180);
        el.style.filter = `brightness(${0.6 + 0.4 * (depth * 0.5 + 0.5)})`;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return (
    <div ref={wrap} className="orbit-wrap" aria-hidden="true">
      <div className="orbit-path" />
      <div ref={ring} className="orbit-ring">
        <div ref={core} className="orbit-core">
          <img src={img('logo.linku.jpeg')} alt="" />
        </div>
        {ORBIT.map((src, i) => (
          <div key={src} ref={(el) => { items.current[i] = el; }} className="orbit-item">
            <Plate src={img(src)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const About: React.FC = () => {
  const { t } = useAppContext();
  const dishCount = MENU_DATA.reduce((n, c) => n + c.items.length, 0);
  return (
    <section className="section" aria-labelledby="about-title">
      <div className="wrap">
        <div className="about-grid">
          <div>
            <Reveal className="eyebrow">{t('about_us_title')}</Reveal>
            <h2 id="about-title" className="h-section" style={{ marginTop: 20 }}>
              <SplitText text={t('about_heading')} />
            </h2>
            <Reveal kind="blur" delay={0.15}>
              <p className="lede" style={{ marginTop: 24 }}>{t('about_us_text')}</p>
            </Reveal>
          </div>
          <Reveal kind="3d">
            <Orbit />
          </Reveal>
        </div>

        <div className="stats" style={{ marginTop: 'clamp(56px, 8vw, 110px)' }}>
          <div className="stat">
            <div className="stat-num">
              <CountUp to={dishCount} />
            </div>
            <div className="stat-label">{t('stat_dishes')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              <CountUp to={4.3} decimals={1} />
              <sup>/5</sup>
            </div>
            <div className="stat-label">{t('stat_rating')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              <CountUp to={234} />
            </div>
            <div className="stat-label">{t('stat_reviews')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              <CountUp to={OCCASIONS_DATA.length} />
            </div>
            <div className="stat-label">{t('stat_occasions')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
