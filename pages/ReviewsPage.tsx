import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { MOCK_REVIEWS, GOOGLE_REVIEWS_URL, FACEBOOK_URL } from '../constants';
import { CountUp, Magnetic, Reveal, SplitText } from '../components/fx/core';
import { IconExternal, IconFacebook, Stars } from '../components/icons/ui';

export const ReviewsPage: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useAppContext();
    return (
        <section id={id} className="section" aria-labelledby="reviews-title">
            <div className="wrap">
                <div className="reviews-head">
                    <div>
                        <Reveal className="eyebrow">{t('reviews_eyebrow')}</Reveal>
                        <h2 id="reviews-title" className="h-section" style={{ marginTop: 16 }}>
                            <SplitText text={t('reviews_title')} />
                        </h2>
                    </div>
                    <Reveal kind="blur" delay={0.1}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
                            <div className="rating-big">
                                <CountUp to={4.3} decimals={1} />
                            </div>
                            <div style={{ paddingBottom: 10 }}>
                                <Stars rating={4.3} size={20} />
                                <div style={{ color: 'var(--cream-dim)', fontSize: 14, marginTop: 6 }}>
                                    {t('reviews_average')} · {t('based_on_reviews')}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                            <Magnetic>
                                <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--brass btn--sm">
                                    <span className="btn-label">{t('all_reviews_google')}</span>
                                    <IconExternal />
                                </a>
                            </Magnetic>
                            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" aria-label={t('join_community')}>
                                <IconFacebook size={16} /> Facebook
                            </a>
                        </div>
                    </Reveal>
                </div>

                <div className="reviews-grid">
                    {MOCK_REVIEWS.map((r, i) => (
                        <Reveal key={r.author} kind="3d" delay={(i % 3) * 0.1}>
                            <figure className="quote" style={{ margin: 0 }}>
                                <Stars rating={r.rating} />
                                <blockquote style={{ margin: 0 }}>
                                    <p>{r.text}</p>
                                </blockquote>
                                <footer>
                                    <figcaption style={{ color: 'var(--cream)', fontWeight: 600 }}>{r.author}</figcaption>
                                </footer>
                            </figure>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
