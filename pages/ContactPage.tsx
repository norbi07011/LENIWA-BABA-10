import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ADDRESS, ADDRESS_LINE_1, ADDRESS_LINE_2, EMAIL, RESTAURANT_PHONE, RESTAURANT_PHONE_INTL } from '../constants';
import { Magnetic, Reveal, SplitText } from '../components/fx/core';
import { OpenPill, OpeningHours } from '../components/OpeningHours';
import { IconExternal, IconPhone, IconPin, IconWhatsApp } from '../components/icons/ui';

const formatPhone = (p: string) => p.replace(/^\+31(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '+31 $1 $2 $3 $4 $5');

export const ContactPage: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useAppContext();
    const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;

    return (
        <section id={id} className="section" aria-labelledby="contact-title">
            <div className="wrap">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 44 }}>
                    <div style={{ maxWidth: 720 }}>
                        <Reveal className="eyebrow">{t('contact_eyebrow')}</Reveal>
                        <h2 id="contact-title" className="h-section" style={{ marginTop: 16 }}>
                            <SplitText text={t('contact_title')} />
                        </h2>
                        <Reveal kind="blur" delay={0.1}>
                            <p className="lede" style={{ marginTop: 16 }}>{t('contact_subtitle')}</p>
                        </Reveal>
                    </div>
                    <OpenPill />
                </div>

                <div className="contact-grid">
                    <div style={{ display: 'grid', gap: 18 }}>
                        <Reveal kind="up" className="info-card">
                            <h3>{t('address')}</h3>
                            <div className="big">
                                {ADDRESS_LINE_1}
                                <br />
                                {ADDRESS_LINE_2}
                            </div>
                            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="link-btn" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginTop: 14 }}>
                                <IconPin size={16} /> {t('directions')}
                            </a>
                        </Reveal>
                        <Reveal kind="up" delay={0.08} className="info-card">
                            <h3>{t('phone')}</h3>
                            <a href={`tel:${RESTAURANT_PHONE}`} className="big mono" style={{ fontFamily: 'var(--font-mono)' }}>
                                {formatPhone(RESTAURANT_PHONE)}
                            </a>
                            <div style={{ color: 'var(--cream-dim)', marginTop: 8, fontSize: 14 }}>
                                {t('email')}: <a href={`mailto:${EMAIL}`} style={{ color: 'var(--cream)' }}>{EMAIL}</a>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                                <Magnetic>
                                    <a href={`tel:${RESTAURANT_PHONE}`} className="btn btn--sm">
                                        <IconPhone size={16} />
                                        <span className="btn-label">{t('call_now')}</span>
                                    </a>
                                </Magnetic>
                                <a href={`https://wa.me/${RESTAURANT_PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                                    <IconWhatsApp size={16} /> {t('whatsapp')}
                                </a>
                            </div>
                        </Reveal>
                        <Reveal kind="up" delay={0.16} className="info-card">
                            <h3>{t('opening_hours')}</h3>
                            <OpeningHours />
                        </Reveal>
                    </div>
                    <Reveal kind="3d" className="map-card">
                        <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Leniwa Baba – Google Maps"
                        />
                        <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="chip" style={{ position: 'absolute', left: 14, bottom: 14, zIndex: 2, fontSize: 12 }}>
                            Google Maps <IconExternal size={12} />
                        </a>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};
