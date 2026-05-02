import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/landing/LandingPage';
import { PlayStub } from '@/play/PlayStub';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { LanguagesPage } from '@/pages/LanguagesPage';
import { ResearchPage } from '@/pages/ResearchPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayStub />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/languages" element={<LanguagesPage />} />
        <Route path="/research" element={<ResearchPage />} />
      </Routes>
    </BrowserRouter>
  );
}
