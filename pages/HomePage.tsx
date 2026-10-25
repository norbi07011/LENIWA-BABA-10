import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { SignatureStory } from '../components/sections/SignatureStory';
import { VelocityMarquee } from '../components/fx/core';

const MARQUEE_DISHES = ['zurek_slaski', 'pierogi_ruskie', 'rolada_slaska', 'golonko_piwie', 'bigos', 'kluski_slaskie_okrasa', 'szarlotka', 'kremowka'];

/** Opening of the page: hero, dish marquee, about with orbit and stats, signature dish story. */
export const HomePage: React.FC<{ ready: boolean }> = ({ ready }) => {
    const { t } = useAppContext();
    return (
        <>
            <Hero ready={ready} />
            <VelocityMarquee items={MARQUEE_DISHES.map((k) => t(k))} />
            <About />
            <SignatureStory />
        </>
    );
};
