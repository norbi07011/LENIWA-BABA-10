import React, { useRef, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SIGNATURE_DISHES } from '../../constants';
import { useScrollFrame } from '../fx/core';
import { clamp, elementProgress, img, prefersReducedMotion } from '../../lib/motion';

/** Sticky scroll storytelling: the plate stays on screen and turns while the dishes change. */
export const SignatureStory: React.FC = () => {
  const { t } = useAppContext();
  const section = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGSVGElement>(null);
  const dots = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const n = SIGNATURE_DISHES.length;

  useScrollFrame(() => {
    const el = section.current;
    if (!el) return;
    const p = elementProgress(el, 'pin');
    const reduced = prefersReducedMotion();
    const idx = Math.min(n - 1, Math.floor(p * n));
    setActive(idx);
    if (plate.current) plate.current.style.transform = reduced ? '' : `rotate(${p * 540}deg) scale(${1 - Math.abs(Math.sin(p * n * Math.PI)) * 0.06})`;
    if (ring.current) ring.current.style.transform = reduced ? '' : `rotate(${-p * 220}deg)`;
    dots.current.forEach((d, i) => d && d.style.setProperty('--f', String(clamp(p * n - i))));
  });

  return (
    <section ref={section} className="story band" style={{ height: `${n * 90 + 40}vh` }} aria-labelledby="story-title">
      <div className="story-stage">
        <div className="wrap">
          <div className="story-grid">
            <div className="story-plate-wrap">
              <div className="story-glow" />
              <svg ref={ring} className="story-ring" viewBox="0 0 400 400" aria-hidden="true">
                <defs>
                  <path id="ring-path" d="M200,200 m-185,0 a185,185 0 1,1 370,0 a185,185 0 1,1 -370,0" />
                </defs>
                <circle cx="200" cy="200" r="198" fill="none" stroke="currentColor" strokeOpacity=".25" />
                <text>
                  <textPath href="#ring-path">LENIWA BABA · KUCHNIA ŚLĄSKA · DEN HAAG · OD GARNKA DO STOŁU · </textPath>
                </text>
              </svg>
              <div ref={plate} className="story-plate">
                <div className="plate">
                  {SIGNATURE_DISHES.map((d, i) => (
                    <img key={d.image} src={img(d.image)} alt={i === active ? t(d.name) : ''} className={i === active ? 'is-on' : ''} loading="lazy" />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="eyebrow">{t('signature_eyebrow')}</div>
              <h2 id="story-title" className="h-section" style={{ marginTop: 16, marginBottom: 28, fontSize: 'clamp(30px, 3.6vw, 52px)' }}>
                {t('signature_title')}
              </h2>
              <div className="story-copy" aria-live="polite">
                {SIGNATURE_DISHES.map((d, i) => (
                  <div key={d.name} className={`story-panel ${i === active ? 'is-on' : ''}`} aria-hidden={i !== active}>
                    <div className="story-index">
                      {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                    </div>
                    <h3 className="h-section" style={{ fontStyle: 'italic', color: 'var(--brass)', marginTop: 10, fontSize: 'clamp(34px, 4.6vw, 68px)' }}>
                      {t(d.name)}
                    </h3>
                    <p className="lede" style={{ marginTop: 14 }}>{t(d.description)}</p>
                  </div>
                ))}
              </div>
              <div className="story-dots" aria-hidden="true">
                {SIGNATURE_DISHES.map((d, i) => (
                  <i key={d.name}>
                    <b ref={(el) => { dots.current[i] = el; }} />
                  </i>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
