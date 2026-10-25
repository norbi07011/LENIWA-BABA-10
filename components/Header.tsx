import React, { useEffect, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Magnetic, useScrollFrame } from './fx/core';
import { IconClose, IconMenu, IconTable } from './icons/ui';
import { lockScroll, scrollToEl } from '../lib/motion';

const SECTIONS = ['home', 'menu', 'reviews', 'reservation', 'contact'] as const;

export const Header: React.FC = () => {
  const { t, tray } = useAppContext();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('home');
  const count = Object.values(tray).reduce((a, b) => a + b, 0);

  // Smart sticky: hide on scroll down, show on scroll up
  const last = React.useRef(0);
  useScrollFrame((s) => {
    const y = s.y;
    setSolid(y > 40);
    if (Math.abs(y - last.current) > 6) {
      setHidden(y > 400 && y > last.current);
      last.current = y;
    }
  });

  // Highlight the section in view
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const links = [
    { id: 'home', label: t('nav_home') },
    { id: 'menu', label: t('nav_menu') },
    { id: 'reviews', label: t('nav_reviews') },
    { id: 'reservation', label: t('nav_reservation') },
    { id: 'contact', label: t('nav_contact') },
  ];

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const wasOpen = open;
    setOpen(false);
    window.setTimeout(() => scrollToEl(id), wasOpen ? 120 : 0);
  };

  return (
    <>
      <header className={`site-header ${solid || open ? 'is-solid' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
        <div className="wrap bar">
          <a href="#home" className="wordmark" onClick={(e) => go(e, 'home')}>
            Leniwa Baba <small>Den Haag</small>
          </a>
          <nav className="nav" aria-label="Main">
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'is-active' : ''} onClick={(e) => go(e, l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <LanguageSwitcher />
            <button
              id="tray-button"
              type="button"
              className="icon-btn"
              aria-label={`${t('tray_title')} (${count})`}
              title={t('tray_title')}
              onClick={() => scrollToEl('reservation')}
            >
              <IconTable />
              {count > 0 && <span className="badge">{count}</span>}
            </button>
            <Magnetic className="header-cta">
              <a href="#reservation" className="btn btn--sm" onClick={(e) => go(e, 'reservation')}>
                <span className="btn-label">{t('book_now')}</span>
              </a>
            </Magnetic>
            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t('close_menu') : t('open_menu')}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>
      <nav id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="Mobile">
        {links.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} tabIndex={open ? 0 : -1} onClick={(e) => go(e, l.id)}>
            <span>0{i + 1}</span>
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
};
