import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { WHATSAPP_RESERVATION_PHONE, RESTAURANT_PHONE, MENU_DATA, OPENING_HOURS } from '../constants';
import { Magnetic, Reveal, RollingNumber, SplitText } from '../components/fx/core';
import { DustCanvas, fireConfetti } from '../components/fx/canvas';
import { IconPhone, IconWhatsApp } from '../components/icons/ui';
import { img, lockScroll, screenShake } from '../lib/motion';

const ALL_ITEMS = MENU_DATA.flatMap((c) => c.items);
const itemByName = (name: string) => ALL_ITEMS.find((i) => i.name === name);

const toMin = (s: string) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
};
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Bookable times for a date: from opening until one hour before the kitchen closes, every 30 min. */
const slotsFor = (date: string): string[] => {
    const day = date ? new Date(`${date}T12:00:00`).getDay() : -1;
    const hours = day >= 0 ? OPENING_HOURS[day] : { open: '12:00', close: '24:00', kitchenOpen: '12:00', kitchenClose: '21:00' };
    if (!hours) return [];
    const out: string[] = [];
    for (let m = toMin(hours.kitchenOpen); m <= toMin(hours.kitchenClose) - 60; m += 30) out.push(fmt(m));
    return out;
};

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="faq-item" data-open={open}>
            <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                <span>{q}</span>
                <span className="plus" aria-hidden="true" />
            </button>
            <div className="ans">
                <div>
                    <p>{a}</p>
                </div>
            </div>
        </div>
    );
};

const VictoryScene: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useAppContext();
    const btn = useRef<HTMLButtonElement>(null);
    const root = useRef<HTMLDivElement>(null);
    useEffect(() => {
        lockScroll(true);
        btn.current?.focus();
        // plates land, then the shockwave, the shake and the confetti
        const a = window.setTimeout(() => {
            screenShake(root.current);
            fireConfetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.45 }, 180);
        }, 1050);
        const b = window.setTimeout(() => fireConfetti({ x: window.innerWidth * 0.2, y: window.innerHeight * 0.8 }, 70), 1400);
        const c = window.setTimeout(() => fireConfetti({ x: window.innerWidth * 0.8, y: window.innerHeight * 0.8 }, 70), 1550);
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => {
            [a, b, c].forEach(window.clearTimeout);
            window.removeEventListener('keydown', onKey);
            lockScroll(false);
        };
    }, [onClose]);
    const plates = [
        { cx: 140, src: 'Żurek śląski.jpg', dl: '0.25s' },
        { cx: 220, src: 'Rolada śląska.jpg', dl: '0.45s' },
        { cx: 300, src: 'Pierogi z mięsem.jpg', dl: '0.65s' },
    ];
    return (
        <div ref={root} className="victory" role="dialog" aria-modal="true" aria-labelledby="victory-title">
            <div className="victory-inner">
                <svg viewBox="0 0 440 280" aria-hidden="true">
                    <defs>
                        {plates.map((p, i) => (
                            <clipPath id={`vp${i}`} key={i}>
                                <circle cx={p.cx} cy="196" r="30" />
                            </clipPath>
                        ))}
                        <radialGradient id="vglow">
                            <stop offset="0" stopColor="#d9a85b" stopOpacity=".35" />
                            <stop offset="1" stopColor="#d9a85b" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="220" cy="210" rx="210" ry="60" fill="url(#vglow)" />
                    <g className="table-top">
                        <ellipse cx="220" cy="210" rx="190" ry="46" fill="#3a2418" />
                        <ellipse cx="220" cy="204" rx="190" ry="46" fill="#5a3824" />
                        <ellipse cx="220" cy="204" rx="160" ry="34" fill="none" stroke="#d9a85b" strokeOpacity=".35" strokeDasharray="4 6" />
                        <path d="M60 220 L70 275 M380 220 L370 275" stroke="#3a2418" strokeWidth="10" strokeLinecap="round" />
                    </g>
                    {plates.map((p, i) => (
                        <g key={i} className="drop" style={{ ['--dl' as any]: p.dl }}>
                            <ellipse cx={p.cx} cy="200" rx="40" ry="14" fill="rgba(0,0,0,.35)" />
                            <circle cx={p.cx} cy="196" r="36" fill="#ece2d0" />
                            <image href={img(p.src)} x={p.cx - 30} y="166" width="60" height="60" preserveAspectRatio="xMidYMid slice" clipPath={`url(#vp${i})`} />
                        </g>
                    ))}
                    {plates.map((p, i) => (
                        <g key={`s${i}`} style={{ ['--dl' as any]: `${1.2 + i * 0.2}s` }}>
                            <path className="steam" style={{ ['--dl' as any]: `${1.2 + i * 0.3}s` }} d={`M${p.cx - 8} 150 q -8 -14 0 -28 q 8 -14 0 -28`} />
                            <path className="steam" style={{ ['--dl' as any]: `${1.5 + i * 0.3}s` }} d={`M${p.cx + 8} 152 q 8 -14 0 -28 q -8 -14 0 -28`} />
                        </g>
                    ))}
                    <circle className="wave" cx="220" cy="196" r="40" style={{ ['--dl' as any]: '1.05s' }} />
                    <circle className="wave" cx="220" cy="196" r="40" style={{ ['--dl' as any]: '1.25s' }} />
                </svg>
                <h3 id="victory-title">{t('victory_title')}</h3>
                <p>{t('victory_text')}</p>
                <p style={{ fontSize: 13, marginTop: -12 }}>{t('reservation_confirmation_info')}</p>
                <button ref={btn} type="button" className="btn btn--brass" onClick={onClose}>
                    {t('close')}
                </button>
            </div>
        </div>
    );
};

const ReservationForm: React.FC<{ onSent: () => void }> = ({ onSent }) => {
    const { t, tray, changeQty, clearTray } = useAppContext();
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({ date: '', time: '18:00', people: 2, phone: '', name: '', special: '' });
    const [errors, setErrors] = useState<{ date?: string; phone?: string }>({});
    const slots = useMemo(() => slotsFor(form.date), [form.date]);
    const closedDay = form.date !== '' && slots.length === 0;
    const trayEntries = Object.entries(tray).filter(([k]) => itemByName(k));

    useEffect(() => {
        if (slots.length && !slots.includes(form.time)) setForm((f) => ({ ...f, time: slots[Math.min(slots.length - 1, Math.floor(slots.length / 2))] }));
    }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

    const set = (k: keyof typeof form, v: string | number) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const next: typeof errors = {};
        if (!form.date) next.date = t('date_required');
        else if (closedDay) next.date = t('monday_closed');
        if (!form.phone.trim()) next.phone = t('phone_required');
        setErrors(next);
        if (Object.keys(next).length) return;

        const dishes = trayEntries.map(([k, q]) => `• ${q}× ${t(k)}`).join('\n');
        const message =
            `${t('whatsapp_reservation_message')}\n\n` +
            `${t('date')}: ${form.date}\n` +
            `${t('time')}: ${form.time}\n` +
            `${t('people')}: ${form.people}\n` +
            `${t('name')}: ${form.name || '-'}\n` +
            `${t('form_phone')}: ${form.phone}\n` +
            `${t('special_requests')}: ${form.special || t('none')}` +
            (dishes ? `\n\n${t('tray_in_message')}:\n${dishes}` : '');
        window.open(`https://wa.me/${WHATSAPP_RESERVATION_PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
        onSent();
    };

    return (
        <form className="form-card" onSubmit={submit} noValidate>
            <div className="form-grid">
                <div className="field">
                    <label htmlFor="res-date">{t('date')} *</label>
                    <input
                        id="res-date"
                        type="date"
                        min={today}
                        className={`input ${errors.date ? 'has-error' : ''}`}
                        value={form.date}
                        onChange={(e) => set('date', e.target.value)}
                        aria-invalid={!!errors.date}
                        aria-describedby={errors.date ? 'res-date-err' : undefined}
                    />
                    {(errors.date || closedDay) && (
                        <span id="res-date-err" className="err">
                            {errors.date || t('monday_closed')}
                        </span>
                    )}
                </div>
                <div className="field">
                    <label htmlFor="res-time">{t('time')}</label>
                    <select id="res-time" className="input" value={form.time} onChange={(e) => set('time', e.target.value)} disabled={closedDay}>
                        {slots.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <span className="label" id="res-people-label">{t('number_of_people')}</span>
                    <div className="stepper" role="group" aria-labelledby="res-people-label">
                        <button type="button" aria-label="−1" onClick={() => set('people', Math.max(1, form.people - 1))}>
                            −
                        </button>
                        <span className="val" aria-live="polite">
                            <RollingNumber value={form.people} />
                            <small>{form.people === 1 ? t('person') : t('guests_short')}</small>
                        </span>
                        <button type="button" aria-label="+1" onClick={() => set('people', Math.min(20, form.people + 1))}>
                            +
                        </button>
                    </div>
                </div>
                <div className="field">
                    <label htmlFor="res-phone">{t('form_phone')} *</label>
                    <input
                        id="res-phone"
                        type="tel"
                        autoComplete="tel"
                        className={`input ${errors.phone ? 'has-error' : ''}`}
                        value={form.phone}
                        placeholder={t('phone_placeholder')}
                        onChange={(e) => set('phone', e.target.value)}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'res-phone-err' : undefined}
                    />
                    {errors.phone && (
                        <span id="res-phone-err" className="err">
                            {errors.phone}
                        </span>
                    )}
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="res-name">{t('name')}</label>
                    <input id="res-name" type="text" autoComplete="name" className="input" value={form.name} placeholder={t('name_placeholder')} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="res-special">{t('special_requests')}</label>
                    <textarea id="res-special" className="input" rows={3} value={form.special} placeholder={t('special_requests_placeholder')} onChange={(e) => set('special', e.target.value)} />
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span className="eyebrow">{t('tray_title')}</span>
                    {trayEntries.length > 0 && (
                        <button type="button" className="link-btn" style={{ fontSize: 13 }} onClick={clearTray}>
                            {t('tray_clear')}
                        </button>
                    )}
                </div>
                {trayEntries.length === 0 ? (
                    <p className="note" style={{ margin: 0 }}>
                        {t('tray_empty')}{' '}
                        <a href="#menu" style={{ color: 'var(--brass)', textDecoration: 'underline' }}>
                            {t('see_menu')}
                        </a>
                    </p>
                ) : (
                    <>
                        <ul className="tray-list">
                            {trayEntries.map(([k, q]) => {
                                const item = itemByName(k)!;
                                return (
                                    <li key={k}>
                                        <img src={img(item.imageIds[0])} alt="" />
                                        <span className="nm">{t(k)}</span>
                                        <span className="qty">
                                            <button type="button" aria-label={`${t('remove')}: ${t(k)}`} onClick={() => changeQty(k, -1)}>
                                                −
                                            </button>
                                            <span className="mono">{q}</span>
                                            <button type="button" aria-label={`+1 ${t(k)}`} onClick={() => changeQty(k, 1)}>
                                                +
                                            </button>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        <p style={{ fontSize: 13, color: 'var(--cream-dim)', margin: '10px 0 0' }}>{t('tray_note')}</p>
                    </>
                )}
            </div>

            <div style={{ marginTop: 26 }}>
                <Magnetic strength={0.2}>
                    <button type="submit" className="btn" style={{ width: '100%', minWidth: 260 }}>
                        <IconWhatsApp size={18} />
                        <span className="btn-label">{t('reserve_via_whatsapp')}</span>
                    </button>
                </Magnetic>
            </div>
        </form>
    );
};

export const ReservationPage: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useAppContext();
    const [sent, setSent] = useState(false);
    const closeVictory = useCallback(() => setSent(false), []);
    const beams = useMemo(() => [0.2, 0.52, 0.82], []);
    return (
        <section id={id} className="section reserve band" aria-labelledby="reserve-title">
            <div className="spotlights" aria-hidden="true">
                <div className="spot" style={{ left: '-3%', ['--a1' as any]: '-14deg', ['--a2' as any]: '2deg', ['--t' as any]: '11s' }} />
                <div className="spot" style={{ left: '27%', ['--a1' as any]: '-6deg', ['--a2' as any]: '7deg', ['--t' as any]: '8s' }} />
                <div className="spot" style={{ left: '58%', ['--a1' as any]: '4deg', ['--a2' as any]: '15deg', ['--t' as any]: '10s' }} />
                <div className="spot-pool" />
                <DustCanvas beams={beams} />
            </div>
            <div className="wrap">
                <div style={{ maxWidth: 720, marginBottom: 44 }}>
                    <Reveal className="eyebrow">{t('reserve_eyebrow')}</Reveal>
                    <h2 id="reserve-title" className="h-section" style={{ marginTop: 16 }}>
                        <SplitText text={t('reservation_title')} />
                    </h2>
                    <Reveal kind="blur" delay={0.1}>
                        <p className="lede" style={{ marginTop: 16 }}>{t('reservation_subtitle')}</p>
                    </Reveal>
                </div>
                <div className="reserve-grid">
                    <Reveal kind="3d">
                        <ReservationForm onSent={() => setSent(true)} />
                    </Reveal>
                    <Reveal kind="right" delay={0.1}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <p className="note" style={{ margin: 0 }}>
                                <strong>{t('reservation_confirmation_info')}</strong>
                            </p>
                            <p className="note" style={{ margin: 0 }}>{t('reservation_large_group_info')}</p>
                            <a href={`tel:${RESTAURANT_PHONE}`} className="btn btn--ghost" style={{ alignSelf: 'flex-start' }}>
                                <IconPhone size={18} />
                                <span className="btn-label">{t('call_now')}</span>
                            </a>
                            <h3 className="h-card" style={{ marginTop: 22 }}>{t('faq_title')}</h3>
                            <div>
                                <FaqItem q={t('faq1_q')} a={t('faq1_a')} />
                                <FaqItem q={t('faq2_q')} a={t('faq2_a')} />
                                <FaqItem q={t('faq3_q')} a={t('faq3_a')} />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
            {sent && <VictoryScene onClose={closeVictory} />}
        </section>
    );
};

export default ReservationPage;
