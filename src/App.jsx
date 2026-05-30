import React, { useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import TasksView from './components/tasks/TasksView';
import CalendarView from './components/calendar/CalendarView';
import AiMeetView from './components/ai/AiMeetView';
import AiSettingsModal from './components/ai/AiSettingsModal';
import NewTaskModal from './components/tasks/NewTaskModal';
import TaskDrawer from './components/tasks/TaskDrawer';

function App() {
  const { activeTab, isNewTaskModalOpen, closeNewTaskModal, selectedTaskId, setSelectedTaskId } = useContext(AppContext);

  return (
    <div className="text-gray-100 font-sans h-screen p-4 md:p-6 overflow-hidden flex flex-col relative">
      {/* Main App Window */}
      <div className="glass-container w-full h-full rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative z-10">
        <Navbar />
        
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'ai' && <AiMeetView />}
      </div>

      {/* Global Modals */}
      {isNewTaskModalOpen && (
        <NewTaskModal onClose={closeNewTaskModal} />
      )}
      {selectedTaskId && (
        <TaskDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
}

export default App;
