import React, { useEffect, useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReservationPage } from './pages/ReservationPage';
import { ContactPage } from './pages/ContactPage';
import { Team, Occasions, Award, Videos } from './components/sections/House';
import { ScrollProgressBar } from './components/fx/core';
import { ParticleIntro } from './components/fx/canvas';
import { useAppContext } from './hooks/useAppContext';
import { initSmoothScroll, lockScroll, prefersReducedMotion } from './lib/motion';

const INTRO_KEY = 'lb-intro-seen';

const shouldPlayIntro = () => {
    if (prefersReducedMotion()) return false;
    try {
        return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
        return false;
    }
};

const AppContent: React.FC = () => {
    const { t } = useAppContext();
    const [intro, setIntro] = useState(shouldPlayIntro);

    useEffect(() => {
        initSmoothScroll();
    }, []);

    useEffect(() => {
        if (!intro) return;
        lockScroll(true);
        return () => lockScroll(false);
    }, [intro]);

    const endIntro = () => {
        try {
            sessionStorage.setItem(INTRO_KEY, '1');
        } catch {
            /* ignore */
        }
        setIntro(false);
    };

    return (
        <>
            {intro && <ParticleIntro text="Leniwa Baba" tagline={t('intro_tagline')} skipLabel={t('intro_skip')} onDone={endIntro} />}
            <ScrollProgressBar />
            <div className="grain" aria-hidden="true" />
            <Header />
            <div id="shell">
                <main>
                    <HomePage ready={!intro} />
                    <MenuPage id="menu" />
                    <Team />
                    <Occasions />
                    <Award />
                    <Videos />
                    <ReviewsPage id="reviews" />
                    <ReservationPage id="reservation" />
                    <ContactPage id="contact" />
                </main>
                <Footer />
            </div>
        </>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
