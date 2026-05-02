import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/landing/LandingPage';
import { PlayStub } from '@/play/PlayStub';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayStub />} />
      </Routes>
    </BrowserRouter>
  );
}
