import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Language } from '../types';
import { NLFlag, ENFlag, TRFlag, PLFlag, SKFlag, DEFlag, HUFlag, FRFlag } from './icons/FlagIcons';

const languageOptions = [
  { code: Language.NL, label: 'NL', Flag: NLFlag },
  { code: Language.EN, label: 'EN', Flag: ENFlag },
  { code: Language.PL, label: 'PL', Flag: PLFlag },
  { code: Language.DE, label: 'DE', Flag: DEFlag },
  { code: Language.FR, label: 'FR', Flag: FRFlag },
  { code: Language.TR, label: 'TR', Flag: TRFlag },
  { code: Language.SK, label: 'SK', Flag: SKFlag },
  { code: Language.HU, label: 'HU', Flag: HUFlag },
];

export const LanguageSwitcher: React.FC<{ direction?: 'up' | 'down' }> = ({ direction = 'down' }) => {
  const { language, setLanguage, t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = languageOptions.find((o) => o.code === language) || languageOptions[0];

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <div className="lang" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`${t('language')}: ${selected.label}`}
        onClick={() => setIsOpen((o) => !o)}
        style={{ width: 'auto', padding: '0 12px', gap: 8, display: 'inline-flex' }}
      >
        <selected.Flag className="flag" />
        <span className="mono" style={{ fontSize: 12 }}>{selected.label}</span>
      </button>
      {isOpen && (
        <div className={`lang-menu ${direction === 'up' ? 'up' : ''}`} role="menu">
          {languageOptions.map(({ code, label, Flag }) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === language}
              aria-pressed={code === language}
              onClick={() => {
                setIsOpen(false);
                setLanguage(code);
              }}
            >
              <Flag className="flag" />
              <span className="mono">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
