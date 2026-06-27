import { useContext, useEffect, useState } from 'react';
import { AppContext } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import TasksView from './components/tasks/TasksView';
import CalendarView from './components/calendar/CalendarView';
import AiMeetView from './components/ai/AiMeetView';
import ReportView from './components/reports/ReportView';
import NewTaskModal from './components/tasks/NewTaskModal';
import TaskDrawer from './components/tasks/TaskDrawer';
import PwaInstallPrompt from './components/ui/PwaInstallPrompt';
import MobileApp from './components/mobile/MobileApp';
import MobileTaskSheet from './components/mobile/MobileTaskSheet';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 639px)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

function App() {
  const { activeTab, isNewTaskModalOpen, closeNewTaskModal, selectedTaskId, setSelectedTaskId } = useContext(AppContext);
  const isMobile = useIsMobile();

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const updateStandaloneClass = () => {
      const isStandalone = media.matches || window.navigator.standalone === true;
      document.documentElement.classList.toggle('is-standalone-pwa', isStandalone);
      const viewportHeight = isStandalone
        ? Math.max(window.innerHeight, window.screen?.height || 0)
        : window.innerHeight;
      document.documentElement.style.setProperty('--orbit-app-height', `${viewportHeight}px`);
    };

    updateStandaloneClass();
    media.addEventListener('change', updateStandaloneClass);
    window.addEventListener('resize', updateStandaloneClass);
    window.visualViewport?.addEventListener('resize', updateStandaloneClass);
    return () => {
      media.removeEventListener('change', updateStandaloneClass);
      window.removeEventListener('resize', updateStandaloneClass);
      window.visualViewport?.removeEventListener('resize', updateStandaloneClass);
    };
  }, []);

  return (
    <>
      {/* Fixed background layer — prevents scroll white flash on mobile */}
      <div id="bg-fixed" aria-hidden="true" />

      <div className="relative z-10 text-gray-100 font-sans h-[100dvh] w-full overflow-hidden sm:hidden">
        <MobileApp />
      </div>

      {/* Desktop/tablet shell */}
      <div className="relative z-10 text-gray-100 font-sans h-[100dvh] w-full hidden sm:flex flex-col overflow-hidden sm:p-4 md:p-6 sm:pb-4">
        {/* Main App Window */}
        <div className="glass-container w-full h-full sm:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative safe-pb-app">
          <Navbar />
          
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'ai' && <AiMeetView />}
          {activeTab === 'reports' && <ReportView />}
        </div>

        {/* Global Modals */}
        {isNewTaskModalOpen && !isMobile && (
          <NewTaskModal onClose={closeNewTaskModal} />
        )}
        {selectedTaskId && !isMobile && (
          <TaskDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        )}

        {/* PWA Install Prompt */}
        {!isMobile && <PwaInstallPrompt />}
      </div>

      {isNewTaskModalOpen && isMobile && (
        <NewTaskModal onClose={closeNewTaskModal} />
      )}
      {selectedTaskId && isMobile && (
        <MobileTaskSheet key={selectedTaskId} taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
      {isMobile && <PwaInstallPrompt />}
    </>
  );
}

export default App;
