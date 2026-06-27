import { useContext } from 'react';
import { Bell } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import MobileAiPage from './MobileAiPage';
import MobileBottomNav from './MobileBottomNav';
import MobileCalendarPage from './MobileCalendarPage';
import MobileReportsPage from './MobileReportsPage';
import MobileTasksPage from './MobileTasksPage';

const pageTitles = {
  tasks: 'Tasks',
  calendar: 'Calendar',
  ai: 'AI Meet',
  reports: 'Reports',
};

function MobileApp() {
  const { activeTab } = useContext(AppContext);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  return (
    <div className="mobile-app-shell">
      <header className="mobile-header">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/favicon.svg" alt="Orbit" className="w-9 h-9 shrink-0 drop-shadow-md" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">Orbit</p>
            <h1 className="text-xl font-black leading-tight text-white truncate">{pageTitles[activeTab]}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={requestNotificationPermission}
          className="mobile-icon-button"
          aria-label="Enable notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <main className="mobile-main">
        {activeTab === 'tasks' && <MobileTasksPage />}
        {activeTab === 'calendar' && <MobileCalendarPage />}
        {activeTab === 'ai' && <MobileAiPage />}
        {activeTab === 'reports' && <MobileReportsPage />}
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default MobileApp;
