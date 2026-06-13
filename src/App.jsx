import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import TasksView from './components/tasks/TasksView';
import CalendarView from './components/calendar/CalendarView';
import AiMeetView from './components/ai/AiMeetView';
import AiSettingsModal from './components/ai/AiSettingsModal';
import ReportView from './components/reports/ReportView';
import NewTaskModal from './components/tasks/NewTaskModal';
import TaskDrawer from './components/tasks/TaskDrawer';
import PwaInstallPrompt from './components/ui/PwaInstallPrompt';

function App() {
  const { activeTab, isNewTaskModalOpen, closeNewTaskModal, selectedTaskId, setSelectedTaskId } = useContext(AppContext);

  return (
    <>
      {/* Fixed background layer — prevents scroll white flash on mobile */}
      <div id="bg-fixed" aria-hidden="true" />

      {/* App shell — use h-dvh for proper mobile viewport height */}
      <div className="relative z-10 text-gray-100 font-sans h-dvh w-full flex flex-col overflow-hidden sm:p-4 md:p-6 pb-16 sm:pb-4">
        {/* Main App Window */}
        <div className="glass-container w-full h-full sm:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative">
          <Navbar />
          
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'ai' && <AiMeetView />}
          {activeTab === 'reports' && <ReportView />}
        </div>

        {/* Global Modals */}
        {isNewTaskModalOpen && (
          <NewTaskModal onClose={closeNewTaskModal} />
        )}
        {selectedTaskId && (
          <TaskDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        )}

        {/* PWA Install Prompt */}
        <PwaInstallPrompt />
      </div>
    </>
  );
}

export default App;
