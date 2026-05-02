import { airportFranceScenario } from '@/scenarios/airportFrance';
import { LessonProvider } from '@/state/lessonStore';
import { ConversationPanel } from '@/ui/ConversationPanel';
import { WorldHud } from '@/ui/WorldHud';

export function FranceAirportLesson() {
  return (
    <LessonProvider scenario={airportFranceScenario}>
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.18),_transparent_48%),linear-gradient(180deg,_#050816_0%,_#09111f_55%,_#050712_100%)] px-4 py-4 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
        <WorldHud scenario={airportFranceScenario} />
        <main className="relative z-20 flex min-h-[calc(100vh-2rem)] items-center justify-center pt-28 pb-28">
          <ConversationPanel />
        </main>
      </div>
    </LessonProvider>
  );
}
