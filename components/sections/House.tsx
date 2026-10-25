import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { ADVERTISEMENTS, HORECA_AWARDS_URL, OCCASIONS_DATA, TEAM_DATA } from '../../constants';
import { Magnetic, Reveal, SplitText, TiltCard } from '../fx/core';
import { asset, img, withViewTransition } from '../../lib/motion';
import { IconArrow, IconArrowLeft, IconExternal, IconPlay } from '../icons/ui';

/* ------------------------------------------------------------------ */
/* Team                                                                 */
/* ------------------------------------------------------------------ */
export const Team: React.FC = () => {
  const { t } = useAppContext();
  return (
    <section className="section band" aria-labelledby="team-title">
      <div className="wrap">
        <div style={{ marginBottom: 44, maxWidth: 720 }}>
          <Reveal className="eyebrow">{t('our_team_label')}</Reveal>
          <h2 id="team-title" className="h-section" style={{ marginTop: 16 }}>
            <SplitText text={t('our_team_title')} />
          </h2>
          <Reveal kind="blur" delay={0.1}>
            <p className="lede" style={{ marginTop: 16 }}>{t('our_team_description')}</p>
          </Reveal>
        </div>
        <div className="team-row">
          {TEAM_DATA.map((m, i) => (
            <Reveal key={m.nameKey} kind="3d" delay={i * 0.08} className="team-card">
              <TiltCard max={9}>
                <img src={img(m.imageId)} alt={t(m.nameKey)} loading="lazy" decoding="async" />
                <div className="shade" />
                <div className="info tilt-pop">
                  <div className="role">{t(m.positionKey)}</div>
                  <div className="h-card" style={{ marginTop: 6 }}>{t(m.nameKey)}</div>
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" style={{ marginTop: 14 }}>
                      {t('visit_website')} <IconExternal />
                    </a>
                  )}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Occasions — 3D coverflow with a picker                               */
/* ------------------------------------------------------------------ */
const OCCASION_COLORS = ['#c8233f', '#d9a85b', '#7fb069', '#f3e7d3', '#1f6fb2', '#e2007a', '#8a6bd1', '#b8a790'];

export const Occasions: React.FC = () => {
  const { t } = useAppContext();
  const [cur, setCur] = useState(0);
  const n = OCCASIONS_DATA.length;
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const go = (i: number) => withViewTransition(() => setCur(((i % n) + n) % n));

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!drag.current && document.visibilityState === 'visible') setCur((c) => (c + 1) % n);
    }, 6500);
    return () => window.clearInterval(id);
  }, [n]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 60) {
      setCur((c) => (((c + (dx < 0 ? 1 : -1)) % n) + n) % n);
      d.x = e.clientX;
      d.moved = true;
    }
  };
  const onUp = () => {
    window.setTimeout(() => (drag.current = null), 0);
  };

  const o = OCCASIONS_DATA[cur];
  return (
    <section className="section" aria-labelledby="occ-title" style={{ overflow: 'hidden' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 24px' }}>
          <Reveal className="eyebrow">{t('occasions_eyebrow')}</Reveal>
          <h2 id="occ-title" className="h-section" style={{ marginTop: 16 }}>
            <SplitText text={t('occasions_title')} />
          </h2>
        </div>

        <div
          className="coverflow"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          role="listbox"
          aria-label={t('occasions_hint')}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setCur((c) => (c + 1) % n);
            if (e.key === 'ArrowLeft') setCur((c) => (c - 1 + n) % n);
          }}
        >
          {OCCASIONS_DATA.map((oc, i) => {
            let off = i - cur;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const hidden = abs > 3;
            const tx = off * 58;
            const rot = off === 0 ? 0 : off > 0 ? -42 : 42;
            const tz = off === 0 ? 80 : -abs * 90;
            return (
              <div
                key={oc.key}
                className="cf-card"
                role="option"
                aria-selected={off === 0}
                onClick={() => !drag.current?.moved && off !== 0 && setCur(i)}
                style={{
                  transform: `translateX(${tx}%) translateZ(${tz}px) rotateY(${rot}deg)`,
                  zIndex: 10 - abs,
                  opacity: hidden ? 0 : 1 - abs * 0.18,
                  filter: off === 0 ? 'none' : `brightness(${0.75 - abs * 0.1})`,
                  pointerEvents: hidden ? 'none' : 'auto',
                  cursor: off === 0 ? 'grab' : 'pointer',
                }}
              >
                <img src={img(oc.imageId)} alt="" loading="lazy" draggable={false} />
                <div className="shade" />
                <div className="reflect" />
                <div className="cap">
                  <div className="h-card">{t(oc.key)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cf-chips" role="group" aria-label={t('occasions_hint')}>
          {OCCASIONS_DATA.map((oc, i) => (
            <button
              key={oc.key}
              type="button"
              className="cf-chip"
              aria-pressed={i === cur}
              style={{ ['--c' as any]: OCCASION_COLORS[i % OCCASION_COLORS.length] }}
              onClick={() => go(i)}
            >
              <i aria-hidden="true" />
              {t(oc.key)}
            </button>
          ))}
        </div>

        <div className="cf-detail" aria-live="polite" style={{ viewTransitionName: 'occasion-detail' } as React.CSSProperties}>
          <p>{t(o.descriptionKey)}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="icon-btn" aria-label={t('previous')} onClick={() => go(cur - 1)}>
              <IconArrowLeft />
            </button>
            <Magnetic>
              <a href="#reservation" className="btn">
                <span className="btn-label">{t('book_now')}</span>
              </a>
            </Magnetic>
            <button type="button" className="icon-btn" aria-label={t('next')} onClick={() => go(cur + 1)}>
              <IconArrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Horeca awards                                                        */
/* ------------------------------------------------------------------ */
export const Award: React.FC = () => {
  const { t } = useAppContext();
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby="award-title">
      <div className="wrap">
        <Reveal kind="3d">
          <div className="award">
            <div>
              <div className="eyebrow">{t('award_eyebrow')}</div>
              <h2 id="award-title" className="h-section" style={{ marginTop: 16, fontSize: 'clamp(32px, 4.4vw, 60px)' }}>
                {t('competition_title')}
              </h2>
              <p style={{ marginTop: 18, fontSize: 19, fontWeight: 600 }}>{t('competition_subtitle').replace(/^🏆\s*/, '')}</p>
              <p className="lede" style={{ marginTop: 10 }}>{t('competition_description')}</p>
              <div style={{ marginTop: 26 }}>
                <Magnetic>
                  <a href={HORECA_AWARDS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--brass">
                    <span className="btn-label">{t('vote_now')}</span>
                    <IconExternal />
                  </a>
                </Magnetic>
              </div>
            </div>
            <TiltCard max={12}>
              <img src={img('konkurs.jpg')} alt="Nederlandse Horeca Prijzen 2025/2026" loading="lazy" />
            </TiltCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Videos                                                               */
/* ------------------------------------------------------------------ */
export const Videos: React.FC = () => {
  const { t } = useAppContext();
  const [playing, setPlaying] = useState<number | null>(null);
  const refs = useRef<Record<number, HTMLVideoElement | null>>({});

  const toggle = (id: number) => {
    Object.entries(refs.current).forEach(([k, v]) => {
      if (v && Number(k) !== id) {
        v.pause();
        v.muted = true;
      }
    });
    const v = refs.current[id];
    if (!v) return;
    if (playing === id) {
      v.pause();
      setPlaying(null);
    } else {
      v.muted = false;
      v.controls = true;
      v.play().catch(() => {});
      setPlaying(id);
    }
  };

  return (
    <section className="section band" aria-labelledby="videos-title">
      <div className="wrap">
        <div style={{ marginBottom: 40, maxWidth: 720 }}>
          <Reveal className="eyebrow">{t('our_videos')}</Reveal>
          <h2 id="videos-title" className="h-section" style={{ marginTop: 16 }}>
            <SplitText text={t('videos_title')} />
          </h2>
          <Reveal kind="blur" delay={0.1}>
            <p className="lede" style={{ marginTop: 14 }}>{t('videos_subtitle')}</p>
          </Reveal>
        </div>
        <div className="video-grid">
          {ADVERTISEMENTS.map((ad, i) => (
            <Reveal key={ad.id} kind="3d" delay={i * 0.08}>
              <div
                className={`video-card ${playing === ad.id ? 'is-playing' : ''}`}
                onClick={() => playing !== ad.id && toggle(ad.id)}
                onMouseEnter={() => {
                  const v = refs.current[ad.id];
                  if (v && playing !== ad.id) {
                    v.muted = true;
                    v.play().catch(() => {});
                  }
                }}
                onMouseLeave={() => {
                  const v = refs.current[ad.id];
                  if (v && playing !== ad.id) v.pause();
                }}
              >
                <video
                  ref={(el) => { refs.current[ad.id] = el; }}
                  src={asset(ad.video)}
                  poster={asset(ad.poster)}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onPause={() => playing === ad.id && setPlaying(null)}
                />
                <div className="shade" />
                <button type="button" className="play" aria-label={`${t('play_video')}: ${t(ad.titleKey)}`} style={{ pointerEvents: 'auto' }} onClick={(e) => (e.stopPropagation(), toggle(ad.id))}>
                  <IconPlay />
                </button>
                <div className="cap">
                  <div className="h-card">{t(ad.titleKey)}</div>
                  <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--cream-dim)' }}>{t(ad.descKey)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
