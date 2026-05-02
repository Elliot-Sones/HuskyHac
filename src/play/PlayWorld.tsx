import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FRANCE_MULTIPLAYER_ROOM_CODE, type SceneMode } from '@/shared/contracts';
import { ArrivalTransition } from '@/play/ArrivalTransition';
import { GroundTravelTransition } from '@/play/GroundTravelTransition';
import { PlayerEntryMock } from '@/play/PlayerEntryMock';
import { resolvePlayDestination, type PlayDestination } from '@/play/destinations';
import { readLocalPlayerProfile, type LocalPlayerProfile } from '@/play/playerProfile';
import { MultiplayerProvider, useMultiplayer } from '@/multiplayer/MultiplayerProvider';
import { LessonProvider, useLessonStore } from '@/state/lessonStore';
import { ConversationPanel } from '@/ui/ConversationPanel';
import { NpcCard } from '@/ui/NpcCard';
import { TransitConversationPanel } from '@/ui/TransitConversationPanel';
import { WorldHud } from '@/ui/WorldHud';
import { WorldCanvas } from '@/world/WorldCanvas';
import { createTransitConversationFocus } from '@/world/transitCamera';
import { getTransitDialogue } from '@/world/transitDialogues';
import type { WorldTransitTarget } from '@/world/worldLayout';

export function PlayWorld() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<'entry' | 'arrival' | 'ground-travel' | 'world'>('entry');
  const [playerProfile, setPlayerProfile] = useState<LocalPlayerProfile>(() => readLocalPlayerProfile());
  const destination = resolvePlayDestination(
    searchParams.get('destination') ?? searchParams.get('country'),
  );

  function handleTravelDestination(destinationId: string) {
    setSearchParams({ destination: destinationId });
    setPhase('ground-travel');
  }

  if (phase === 'entry') {
    return (
      <PlayerEntryMock
        destination={destination}
        onLaunch={(profile) => {
          setPlayerProfile(profile);
          setPhase('arrival');
        }}
      />
    );
  }

  if (phase === 'arrival') {
    return <ArrivalTransition destination={destination} onComplete={() => setPhase('world')} />;
  }

  if (phase === 'ground-travel') {
    return <GroundTravelTransition destination={destination} onComplete={() => setPhase('world')} />;
  }

  return (
    <MultiplayerProvider>
      <LessonProvider key={destination.id} scenario={destination.scenario}>
        <PlayWorldInner
          destination={destination}
          playerProfile={playerProfile}
          onTravelDestination={handleTravelDestination}
        />
      </LessonProvider>
    </MultiplayerProvider>
  );
}

function PlayWorldInner({
  destination,
  playerProfile,
  onTravelDestination,
}: {
  destination: PlayDestination;
  playerProfile: LocalPlayerProfile;
  onTravelDestination: (destinationId: string) => void;
}) {
  const lesson = useLessonStore();
  const multiplayer = useMultiplayer();
  const requestedSharedRoomRef = useRef(false);
  const [mode, setMode] = useState<SceneMode>('world');
  const [isNearNpc, setIsNearNpc] = useState(false);
  const [nearTransit, setNearTransit] = useState<WorldTransitTarget | null>(null);
  const [activeTransit, setActiveTransit] = useState<WorldTransitTarget | null>(null);
  const activeTransitDialogue = activeTransit ? getTransitDialogue(activeTransit.id) : null;
  const activeTransitFocus = useMemo(
    () => (activeTransit ? createTransitConversationFocus(activeTransit) : null),
    [activeTransit],
  );
  const canvasMode: SceneMode = activeTransitDialogue ? 'conversation' : mode;

  useEffect(() => {
    if (multiplayer.disabled || requestedSharedRoomRef.current) return;

    requestedSharedRoomRef.current = true;
    void multiplayer.joinRoom(FRANCE_MULTIPLAYER_ROOM_CODE);
  }, [multiplayer.disabled, multiplayer.joinRoom]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && activeTransit) {
        setActiveTransit(null);
        return;
      }
      if (event.key === 'Escape' && mode === 'conversation') {
        setMode('world');
      }
      if (event.key.toLowerCase() === 'm' && mode === 'conversation') {
        lesson.toggleListening();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTransit, lesson, mode]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-200 text-white">
      <WorldCanvas
        mode={canvasMode}
        layout={destination.layout}
        Scene={destination.Scene}
        npc={lesson.scenario.npc}
        isNearNpc={isNearNpc}
        conversationStatus={activeTransitDialogue ? 'idle' : lesson.status}
        onNearNpcChange={setIsNearNpc}
        onNearTransitChange={setNearTransit}
        onInteract={() => {
          setActiveTransit(null);
          setMode('conversation');
        }}
        onTransitInteract={(target) => setActiveTransit(target)}
        conversationFocus={activeTransitFocus}
        playerProfile={playerProfile}
        multiplayerRoom={multiplayer.room}
        multiplayerSelfId={multiplayer.self?.id}
        remoteSnapshots={multiplayer.remoteSnapshots}
        onPublishSnapshot={multiplayer.publishSnapshot}
      />

      {mode === 'world' && !activeTransitDialogue && (
        <WorldHud
          scenario={lesson.scenario}
          isNearNpc={isNearNpc}
          nearTransit={nearTransit}
        />
      )}

      {mode === 'world' && activeTransitDialogue && (
        <>
          {activeTransitFocus?.view === 'taxiInterior' && <TaxiCabinFrame />}
          <TransitConversationPanel
            dialogue={activeTransitDialogue}
            onClose={() => setActiveTransit(null)}
            onTravelDestination={(destinationId) => {
              setActiveTransit(null);
              setMode('world');
              onTravelDestination(destinationId);
            }}
          />
        </>
      )}

      {mode === 'conversation' && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-0 bg-slate-950/15" />
          <div className="pointer-events-auto absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4">
            <NpcCard npc={lesson.scenario.npc} personality={lesson.scenario.personaPrompt} />
            <button
              type="button"
              onClick={() => setMode('world')}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-[12px] font-bold text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-2xl transition hover:bg-slate-900"
            >
              ESC Leave
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
            <ConversationPanel />
          </div>
        </div>
      )}

      {lesson.status === 'complete' && (
        <div className="pointer-events-none absolute right-6 top-28 z-30 rotate-[-3deg] rounded-2xl border-2 border-emerald-200/70 bg-emerald-400/15 px-5 py-4 text-emerald-50 shadow-2xl shadow-emerald-950/30 backdrop-blur-2xl">
          <div className="text-[11px] font-black uppercase tracking-[0.24em]">Scene complete</div>
          <div className="mt-1 text-[18px] font-black">{lesson.scenario.destination} unlocked</div>
        </div>
      )}
    </div>
  );
}

function TaxiCabinFrame() {
  return (
    <div
      data-testid="taxi-cabin-frame"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/72 to-transparent" />
      <div className="absolute left-[6%] top-0 h-[58%] w-8 origin-top rotate-[-10deg] rounded-b-full bg-slate-950/70 shadow-2xl shadow-black/40" />
      <div className="absolute right-[6%] top-0 h-[58%] w-8 origin-top rotate-[10deg] rounded-b-full bg-slate-950/70 shadow-2xl shadow-black/40" />
      <div className="absolute left-1/2 top-9 grid h-10 w-24 -translate-x-1/2 place-items-center rounded-xl border border-yellow-100/30 bg-yellow-300/85 text-[13px] font-black tracking-[0.18em] text-slate-950 shadow-xl shadow-black/25">
        TAXI
      </div>
      <div className="absolute left-[12%] right-[12%] top-[18%] h-px bg-white/30" />
      <div className="absolute inset-x-[8%] bottom-[24%] h-28 rounded-t-[44px] border-t border-white/10 bg-slate-950/72 shadow-2xl shadow-black/55" />
      <div className="absolute bottom-[25%] left-[12%] h-24 w-24 rounded-full border-[10px] border-slate-900/90 shadow-xl shadow-black/45" />
      <div className="absolute bottom-[29%] right-[14%] rounded-xl border border-white/10 bg-slate-900/88 px-4 py-3 shadow-xl shadow-black/40">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-yellow-200/80">Meter</div>
        <div className="mt-1 text-[18px] font-black text-white">12,40 EUR</div>
      </div>
    </div>
  );
}
