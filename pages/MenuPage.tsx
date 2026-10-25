import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { MENU_DATA, FACEBOOK_URL } from '../constants';
import { MenuItem } from '../types';
import { SoupIcon, MainCourseIcon, AppetizerIcon, DessertIcon, DrinkIcon } from '../components/icons/MenuIcons';
import { Magnetic, Reveal, SplitText, TiltCard, ZoomLens } from '../components/fx/core';
import { flyToTray } from '../components/fx/canvas';
import { IconArrowLeft, IconArrow, IconCheck, IconClose, IconFacebook, IconPlus } from '../components/icons/ui';
import { img, lockScroll, withViewTransition } from '../lib/motion';

const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
    category_soups: SoupIcon,
    category_main_courses: MainCourseIcon,
    category_appetizers: AppetizerIcon,
    category_desserts: DessertIcon,
    category_drinks: DrinkIcon,
};

const CHEF_PICKS = new Set(['zurek_slaski', 'rolada_slaska', 'pierogi_ruskie', 'golonko_piwie', 'szarlotka', 'kompot_babuni']);

const useToast = () => {
    const [msg, setMsg] = useState<string | null>(null);
    const timer = useRef<number | undefined>(undefined);
    const show = useCallback((m: string) => {
        setMsg(m);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setMsg(null), 2200);
    }, []);
    return [msg, show] as const;
};

const AddButton: React.FC<{ item: MenuItem; mediaRef: React.RefObject<HTMLElement>; onAdded: () => void }> = ({ item, mediaRef, onAdded }) => {
    const { t, tray, addToTray } = useAppContext();
    const qty = tray[item.name] || 0;
    return (
        <button
            type="button"
            className={`add-btn ${qty ? 'is-added' : ''}`}
            onClick={() => {
                flyToTray(mediaRef.current, img(item.imageIds[0]), () => addToTray(item.name));
                onAdded();
            }}
            aria-label={`${t('add_to_table')}: ${t(item.name)}`}
        >
            {qty ? <IconCheck size={16} /> : <IconPlus size={16} />}
            {qty ? `${t('added_to_table')} · ${qty}` : t('add_to_table')}
        </button>
    );
};

const DishModal: React.FC<{ item: MenuItem; onClose: () => void; onAdded: () => void }> = ({ item, onClose, onAdded }) => {
    const { t } = useAppContext();
    const [idx, setIdx] = useState(0);
    const mediaRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        lockScroll(true);
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (item.imageIds.length > 1 && e.key === 'ArrowRight') setIdx((i) => (i + 1) % item.imageIds.length);
            if (item.imageIds.length > 1 && e.key === 'ArrowLeft') setIdx((i) => (i - 1 + item.imageIds.length) % item.imageIds.length);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            lockScroll(false);
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose, item]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dish-title" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
                <button ref={closeRef} type="button" className="icon-btn modal-close" onClick={onClose} aria-label={t('close')}>
                    <IconClose />
                </button>
                <div ref={mediaRef} className="modal-media">
                    <ZoomLens src={img(item.imageIds[idx])} alt={t(item.name)} hint={t('zoom_hint')} />
                    {item.imageIds.length > 1 && (
                        <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', gap: 8, zIndex: 5 }}>
                            <button type="button" className="icon-btn" aria-label={t('previous')} onClick={() => setIdx((i) => (i - 1 + item.imageIds.length) % item.imageIds.length)}>
                                <IconArrowLeft />
                            </button>
                            <button type="button" className="icon-btn" aria-label={t('next')} onClick={() => setIdx((i) => (i + 1) % item.imageIds.length)}>
                                <IconArrow />
                            </button>
                        </div>
                    )}
                </div>
                <div className="modal-body">
                    {CHEF_PICKS.has(item.name) && <span className="chip chip--beet" style={{ alignSelf: 'flex-start' }}>{t('chef_pick')}</span>}
                    <h3 id="dish-title" className="h-section" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>{t(item.name)}</h3>
                    <p className="lede" style={{ margin: 0 }}>{t(item.description)}</p>
                    <div className="list-cols" style={{ marginTop: 8 }}>
                        <div>
                            <h4>{t('ingredients')}</h4>
                            <ul>
                                {item.ingredientKeys?.map((k) => <li key={k}>{t(k)}</li>)}
                            </ul>
                        </div>
                        <div className="allergen">
                            <h4>{t('allergens')}</h4>
                            {item.allergenKeys && item.allergenKeys.length > 0 ? (
                                <ul>
                                    {item.allergenKeys.map((k) => <li key={k}>{t(k)}</li>)}
                                </ul>
                            ) : (
                                <p style={{ margin: 0, color: 'var(--cream-dim)', fontSize: 14 }}>{t('no_allergens_listed')}</p>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <AddButton item={item} mediaRef={mediaRef} onAdded={onAdded} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DishCard: React.FC<{ item: MenuItem; onOpen: () => void; onAdded: () => void }> = ({ item, onOpen, onAdded }) => {
    const { t } = useAppContext();
    const media = useRef<HTMLDivElement>(null);
    return (
        <TiltCard className="dish-card" max={7}>
            <div ref={media} className="dish-media" onClick={onOpen} role="button" tabIndex={0} aria-label={`${t('menu_details')}: ${t(item.name)}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}>
                {CHEF_PICKS.has(item.name) && <span className="chip chip--beet tag">{t('chef_pick')}</span>}
                <img src={img(item.imageIds[0])} alt={t(item.name)} loading="lazy" decoding="async" />
            </div>
            <div className="dish-body">
                <h3 className="h-card">{t(item.name)}</h3>
                <p>{t(item.description)}</p>
                <div className="dish-actions">
                    <button type="button" className="link-btn" onClick={onOpen}>
                        {t('menu_details')}
                    </button>
                    <AddButton item={item} mediaRef={media} onAdded={onAdded} />
                </div>
            </div>
        </TiltCard>
    );
};

export const MenuPage: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useAppContext();
    const [active, setActive] = useState(MENU_DATA[0].category);
    const [selected, setSelected] = useState<MenuItem | null>(null);
    const [toast, showToast] = useToast();
    const items = MENU_DATA.find((c) => c.category === active)?.items || [];
    const added = () => showToast(t('tray_added_toast'));

    return (
        <section id={id} className="section" aria-labelledby="menu-title">
            <div className="wrap">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 28, marginBottom: 40 }}>
                    <div style={{ maxWidth: 680 }}>
                        <Reveal className="eyebrow">{t('menu_eyebrow')}</Reveal>
                        <h2 id="menu-title" className="h-section" style={{ marginTop: 16 }}>
                            <SplitText text={t('menu_title')} />
                        </h2>
                        <Reveal kind="blur" delay={0.1}>
                            <p className="lede" style={{ marginTop: 16 }}>{t('menu_subtitle')}</p>
                        </Reveal>
                    </div>
                </div>

                <div className="tabs" role="tablist" aria-label={t('menu_title')} style={{ marginBottom: 32 }}>
                    {MENU_DATA.map((c) => {
                        const Icon = categoryIcons[c.category];
                        return (
                            <button
                                key={c.category}
                                type="button"
                                role="tab"
                                className="tab"
                                aria-selected={active === c.category}
                                onClick={() => active !== c.category && withViewTransition(() => setActive(c.category))}
                            >
                                {Icon && <Icon className="ico" />}
                                {t(c.category)}
                                <span className="count">{c.items.length}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="menu-grid" role="tabpanel">
                    {items.map((item) => (
                        <DishCard key={item.name} item={item} onOpen={() => withViewTransition(() => setSelected(item))} onAdded={added} />
                    ))}
                </div>

                <Reveal kind="up">
                    <div className="fb-band" style={{ ['--img' as any]: `url("${img('TŁO FACEBOOK .jpg')}")` }}>
                        <h3>{t('daily_menu_facebook')}</h3>
                        <Magnetic>
                            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="btn btn--brass">
                                <IconFacebook size={18} />
                                <span className="btn-label">{t('view_daily_menu_facebook')}</span>
                            </a>
                        </Magnetic>
                    </div>
                </Reveal>
            </div>
            {selected && <DishModal item={selected} onClose={() => setSelected(null)} onAdded={added} />}
            {toast && (
                <div className="toast" role="status">
                    {toast}
                </div>
            )}
        </section>
    );
};
