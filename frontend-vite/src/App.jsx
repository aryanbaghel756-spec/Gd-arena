import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiscussionProvider, useDiscussion } from './context/DiscussionContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/auth/LandingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SetupPage } from './components/setup/SetupPage';
import { ArenaPage } from './components/arena/ArenaPage';
import { ReportPage } from './components/report/ReportPage';
import { HistoryPage } from './components/history/HistoryPage';
import { InsightsPage } from './components/insights/InsightsPage';

import { HexagonGridBackground } from './components/common/HexagonGridBackground';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { currentScreen, navigate } = useDiscussion();

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100 bg-[#050507]">
      {/* Subtle Animated Honeycomb / Hexagonal Grid Canvas */}
      <HexagonGridBackground />

      <Navbar />

      <main className="flex-1 relative z-10">
        {currentScreen === 'landing' && <LandingPage />}
        {currentScreen === 'dashboard' && <DashboardPage />}
        {currentScreen === 'setup' && <SetupPage />}
        {currentScreen === 'arena' && <ArenaPage />}
        {currentScreen === 'report' && <ReportPage />}
        {currentScreen === 'history' && <HistoryPage />}
        {currentScreen === 'insights' && <InsightsPage />}
      </main>

      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DiscussionProvider>
        <AppContent />
      </DiscussionProvider>
    </AuthProvider>
  );
}
