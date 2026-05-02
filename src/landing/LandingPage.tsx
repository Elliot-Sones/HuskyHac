import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountryChip } from './CountryChip';
import { featureCentroid, GlobeCanvas, type GlobePin } from './GlobeCanvas';
import { HeroTitle } from './HeroTitle';
import { StarField } from './StarField';
import { StartCTA } from './StartCTA';
import { Toast } from './Toast';
import { TopNav } from './TopNav';
import { SUPPORTED, TEASERS } from './countries';

type Selection = {
  name: string;
  flag: string;
  meta: string;
  isSupported: boolean;
};

export function LandingPage() {
  const navigate = useNavigate();
  const [introMode, setIntroMode] = useState(true);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pin, setPin] = useState<GlobePin | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [boarding, setBoarding] = useState<'idle' | 'flash' | 'fade'>('idle');
  const toastTimer = useRef<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  function flashToast(message: string) {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }

  function handlePick(name: string, feature: any) {
    const supported = SUPPORTED[name];
    const teaser = TEASERS[name];
    const flag = supported?.flag ?? teaser?.flag ?? '🏳️';
    const [lng, lat] = supported ? supported.centroid : featureCentroid(feature);
    setIntroMode(false);
    setPin({ lat, lng, flag });
    setSelection({
      name,
      flag,
      meta: supported ? supported.subtitle : `${teaser!.language} · in production`,
      isSupported: !!supported,
    });
  }

  function handleClear() {
    setSelection(null);
    setPin(null);
  }

  function handleStart() {
    if (!selection?.isSupported) return;
    const slug = SUPPORTED[selection.name].slug;
    setBoarding('flash');
    window.setTimeout(() => setBoarding('fade'), 700);
    window.setTimeout(() => navigate(`/play?country=${slug}`), 1450);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const ctaLabel = selection
    ? selection.isSupported
      ? 'Start simulating your experience'
      : `${TEASERS[selection.name].language} — coming soon`
    : 'Start simulating your experience';

  const ctaSubline = selection
    ? selection.isSupported
      ? `Arriving at ${SUPPORTED[selection.name].place}`
      : `${selection.name} routes are in production`
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
        onUnknownCountry={(name) => flashToast(`${name} isn't on the language map yet.`)}
      />
      <div className="grain" />
      <div className="vignette" />

      <TopNav />
      <HeroTitle active={introMode} onExplore={() => setIntroMode(false)} />

      <CountryChip
        visible={!!selection}
        flag={selection?.flag ?? '🇫🇷'}
        name={selection?.name ?? 'France'}
        meta={selection?.meta ?? 'French · A1 → B2 routes'}
        onClear={handleClear}
      />

      <Toast visible={!!toast} message={toast ?? ''} />

      <div className="hint fixed bottom-7 left-8 sm:left-12 z-20 text-[11px] text-slate-500 hidden sm:flex items-center gap-2 font-mono">
        <span>drag</span>
        <span className="opacity-30">to spin</span>
        <span className="opacity-20">·</span>
        <span>scroll</span>
        <span className="opacity-30">to zoom</span>
      </div>
      <div className="hint fixed bottom-7 right-8 sm:right-12 z-20 text-[11px] text-slate-500 font-mono">
        v0.1 · landing
      </div>

      <StartCTA
        visible={!!selection}
        flag={selection?.flag ?? '🇫🇷'}
        label={ctaLabel}
        subline={ctaSubline}
        disabled={!selection?.isSupported}
        onClick={handleStart}
      />
    </div>
  );
}
