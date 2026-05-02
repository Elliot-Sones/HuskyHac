import { useEffect, useState } from 'react';
import type { SceneMode } from '@/shared/contracts';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { LessonProvider, useLessonStore } from '@/state/lessonStore';
import { ConversationPanel } from '@/ui/ConversationPanel';
import { WorldHud } from '@/ui/WorldHud';
import { WorldCanvas } from '@/world/WorldCanvas';

export function PlayWorld() {
  return (
    <LessonProvider scenario={airportFranceScenario}>
      <PlayWorldInner />
    </LessonProvider>
  );
}

function PlayWorldInner() {
  const lesson = useLessonStore();
  const [mode, setMode] = useState<SceneMode>('world');
  const [isNearNpc, setIsNearNpc] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && mode === 'conversation') {
        setMode('world');
      }
      if (event.key.toLowerCase() === 'm' && mode === 'conversation') {
        lesson.toggleListening();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lesson, mode]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-200 text-white">
      <WorldCanvas
        mode={mode}
        isNearNpc={isNearNpc}
        conversationStatus={lesson.status}
        onNearNpcChange={setIsNearNpc}
        onInteract={() => {
          lesson.setStatus('speaking');
          setMode('conversation');
        }}
      />

      {mode === 'world' && <WorldHud scenario={airportFranceScenario} isNearNpc={isNearNpc} />}

      {mode === 'conversation' && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1.5px]" />
          <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/75 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Live roleplay
              </div>
              <div className="mt-1 text-[15px] font-black text-white">
                Mme. Laurent · Airport information
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('world')}
              className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-[12px] font-bold text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-2xl transition hover:bg-slate-900"
            >
              ESC Leave
            </button>
          </div>

          <div
            data-testid="conversation-panel"
            className="absolute inset-x-0 bottom-0 z-30 p-4 pointer-events-auto"
          >
            <ConversationPanel />
          </div>
        </div>
      )}

      {lesson.status === 'complete' && (
        <div className="pointer-events-none absolute right-6 top-28 z-30 rotate-[-3deg] rounded-2xl border-2 border-emerald-200/70 bg-emerald-400/15 px-5 py-4 text-emerald-50 shadow-2xl shadow-emerald-950/30 backdrop-blur-2xl">
          <div className="text-[11px] font-black uppercase tracking-[0.24em]">Scene complete</div>
          <div className="mt-1 text-[18px] font-black">Paris directions unlocked</div>
        </div>
      )}
    </div>
  );
}
