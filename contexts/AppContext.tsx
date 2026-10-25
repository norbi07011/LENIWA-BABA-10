import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppContextType, Language } from '../types';
import { translations } from '../i18n/translations';
import { withViewTransition } from '../lib/motion';

export const AppContext = createContext<AppContextType | null>(null);

const readLang = (): Language => {
    try {
        const stored = localStorage.getItem('language') as Language;
        if (stored && Object.values(Language).includes(stored)) return stored;
    } catch {
        /* storage unavailable */
    }
    return Language.NL;
};

const readTray = (): Record<string, number> => {
    try {
        const raw = localStorage.getItem('lb-tray');
        if (raw) return JSON.parse(raw);
    } catch {
        /* storage unavailable */
    }
    return {};
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(readLang);
    const [tray, setTray] = useState<Record<string, number>>(readTray);

    useEffect(() => {
        try {
            localStorage.setItem('language', language);
        } catch {
            /* ignore */
        }
        document.documentElement.lang = language.toLowerCase();
    }, [language]);

    useEffect(() => {
        try {
            localStorage.setItem('lb-tray', JSON.stringify(tray));
        } catch {
            /* ignore */
        }
    }, [tray]);

    const setLanguage = useCallback((next: Language) => {
        withViewTransition(() => setLanguageState(next));
    }, []);

    const t = useCallback((key: string): string => translations[key]?.[language] || translations[key]?.[Language.EN] || key, [language]);

    const addToTray = useCallback((dish: string) => setTray((p) => ({ ...p, [dish]: (p[dish] || 0) + 1 })), []);
    const changeQty = useCallback(
        (dish: string, delta: number) =>
            setTray((p) => {
                const n = (p[dish] || 0) + delta;
                const next = { ...p };
                if (n <= 0) delete next[dish];
                else next[dish] = n;
                return next;
            }),
        []
    );
    const clearTray = useCallback(() => setTray({}), []);

    const value = useMemo<AppContextType>(
        () => ({
            language,
            setLanguage,
            t,
            theme: 'dark',
            toggleTheme: () => {},
            tray,
            addToTray,
            changeQty,
            clearTray,
        }),
        [language, setLanguage, t, tray, addToTray, changeQty, clearTray]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
