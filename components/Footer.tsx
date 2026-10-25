import React, { useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import {
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  NORBS_URL,
  RESTAURANT_PHONE,
} from '../constants';
import { OpeningHours } from './OpeningHours';
import { useScrollFrame } from './fx/core';
import { IconFacebook, IconInstagram } from './icons/ui';

const formatPhone = (p: string) => p.replace(/^\+31(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '+31 $1 $2 $3 $4 $5');

export const Footer: React.FC = () => {
  const { t } = useAppContext();
  const fillRef = useRef<HTMLDivElement>(null);

  // Scroll-driven text fill: the wordmark fills with beetroot red as you reach the end of the page
  useScrollFrame(() => {
    const el = fillRef.current;
    if (!el) return;
    // 0 when the word enters at the bottom of the screen, 1 once it has fully risen into view
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (r.height + 60)));
    el.style.setProperty('--fill', f.toFixed(3));
  });

  const links = [
    { href: '#home', label: t('nav_home') },
    { href: '#menu', label: t('nav_menu') },
    { href: '#reviews', label: t('nav_reviews') },
    { href: '#reservation', label: t('nav_reservation') },
    { href: '#contact', label: t('nav_contact') },
  ];

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="wordmark" style={{ fontSize: 34 }}>Leniwa Baba</div>
            <p className="lede" style={{ fontSize: 15, marginTop: 12 }}>{t('footer_about')}</p>
            <div className="social" aria-label={t('footer_follow')}>
              <a className="icon-btn" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <IconFacebook />
              </a>
              <a className="icon-btn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <IconInstagram />
              </a>
            </div>
          </div>
          <div>
            <h4>{t('quick_links')}</h4>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t('nav_contact')}</h4>
            <ul>
              <li>
                {ADDRESS_LINE_1}
                <br />
                {ADDRESS_LINE_2}
              </li>
              <li>
                <a href={`tel:${RESTAURANT_PHONE}`} className="mono">{formatPhone(RESTAURANT_PHONE)}</a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t('opening_hours')}</h4>
            <OpeningHours compact />
          </div>
        </div>

        <div ref={fillRef} className="fill-text" aria-hidden="true">
          Leniwa Baba
        </div>

        <div className="footer-bottom">
          <span>{t('copyright')}</span>
          <span>
            {t('footer_site_by')}{' '}
            <a href={NORBS_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cream)' }}>
              NORBS SERVICE
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
