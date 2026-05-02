import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountryChip } from './CountryChip';
import { featureCentroid, GlobeCanvas, type GlobePin } from './GlobeCanvas';
import { HeroTitle } from './HeroTitle';
import { StarField } from './StarField';
import { StartCTA } from './StartCTA';
import { TopNav } from './TopNav';
import { countrySlug, flagFromIsoA2, SUPPORTED, TEASERS } from './countries';
import { getCountryLearningProfile } from '@/scenarios/countryAirportScenario';

type Selection = {
  name: string;
  flag: string;
  meta: string;
};

export function LandingPage() {
  const navigate = useNavigate();
  const [introMode, setIntroMode] = useState(true);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pin, setPin] = useState<GlobePin | null>(null);
  const [boarding, setBoarding] = useState<'idle' | 'flash' | 'fade'>('idle');
  const bodyRef = useRef<HTMLDivElement>(null);

  function handlePick(name: string, feature: any) {
    const supported = SUPPORTED[name];
    const teaser = TEASERS[name];
    const profile = getCountryLearningProfile(name);
    const iso = (feature?.properties?.ISO_A2 as string | undefined) ?? null;
    const flag = supported?.flag ?? teaser?.flag ?? flagFromIsoA2(iso);
    const [lng, lat] = supported ? supported.centroid : featureCentroid(feature);
    setIntroMode(false);
    setPin({ lat, lng, flag });
    setSelection({
      name,
      flag,
      meta: supported
        ? supported.subtitle
        : `${profile.language.name} · ${profile.city} airport route`,
    });
  }

  function handleClear() {
    setSelection(null);
    setPin(null);
  }

  function handleStart() {
    if (!selection) return;
    const slug = SUPPORTED[selection.name]?.slug ?? countrySlug(selection.name);
    setBoarding('flash');
    window.setTimeout(() => setBoarding('fade'), 700);
    window.setTimeout(() => navigate(`/play?country=${slug}`), 1450);
  }

  const ctaLabel = 'Start simulating your experience';

  const ctaSubline = selection
    ? `Arriving at ${SUPPORTED[selection.name]?.place ?? getCountryLearningProfile(selection.name).airport}`
    : '';

  return (
    <div
      ref={bodyRef}
      className={`landing-shell no-select boarding ${introMode ? 'intro-mode' : 'active-mode'} ${
        boarding === 'flash' ? 'flash' : ''
      } ${boarding === 'fade' ? 'fade' : ''}`}
    >
      <div className="stars" />
      <StarField />
      <GlobeCanvas
        selected={selection?.name ?? null}
        pin={pin}
        onPickCountry={handlePick}
      />
      <div className="grain" />
      <div className="vignette" />

      <TopNav />
      {introMode && <HeroTitle active={introMode} onExplore={() => setIntroMode(false)} />}

      <CountryChip
        visible={!!selection}
        flag={selection?.flag ?? '🏳️'}
        name={selection?.name ?? ''}
        meta={selection?.meta ?? ''}
        onClear={handleClear}
      />

      <div className="hint fixed bottom-7 left-8 sm:left-12 z-20 text-[11px] text-slate-500 hidden sm:flex items-center gap-2 font-mono">
        <span>drag</span>
        <span className="opacity-30">to spin</span>
        <span className="opacity-20">·</span>
        <span>scroll</span>
        <span className="opacity-30">to zoom</span>
      </div>
      <div className="hint fixed bottom-7 right-8 sm:right-12 z-20 text-[11px] text-slate-500 font-mono">
        v0.2 · landing
      </div>

      <StartCTA
        visible={!!selection}
        flag={selection?.flag ?? '🏳️'}
        label={ctaLabel}
        subline={ctaSubline}
        disabled={!selection}
        onClick={handleStart}
      />
    </div>
  );
}
