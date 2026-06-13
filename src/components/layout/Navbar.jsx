import React, { useContext } from 'react';
import { Layers, Sparkles, Bell, Orbit, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function Navbar() {
  const { activeTab, switchGlobalTab } = useContext(AppContext);

  const getSliderStyle = () => {
    switch (activeTab) {
      case 'tasks':
        return { transform: 'translateX(0px)', width: '90px' };
      case 'calendar':
        return { transform: 'translateX(90px)', width: '110px' };
      case 'ai':
        return { transform: 'translateX(200px)', width: '130px' };
      case 'reports':
        return { transform: 'translateX(330px)', width: '110px' };
      default:
        return { transform: 'translateX(0px)', width: '90px' };
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  return (
    <>
      {/* DESKTOP & MOBILE TOP HEADER */}
      <nav className="safe-min-h-top sm:min-h-20 safe-pt shrink-0 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 bg-transparent z-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <img src="/favicon.svg" alt="Orbit Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">Orbit</span>
        </div>

        {/* Center Tabs (Global Navigation) - HIDDEN ON MOBILE */}
        <div className="hidden sm:flex relative bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md items-center shadow-inner shrink-0">
          <div 
            className="absolute left-1 top-1 bottom-1 bg-white rounded-full transition-transform duration-300 ease-out shadow-lg"
            style={getSliderStyle()}
          ></div>
          
          <button 
            onClick={() => switchGlobalTab('tasks')} 
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold transition-colors w-[90px] flex items-center justify-center whitespace-nowrap ${
              activeTab === 'tasks' ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tasks
          </button>
          <button 
            onClick={() => switchGlobalTab('calendar')} 
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold transition-colors w-[110px] flex items-center justify-center whitespace-nowrap ${
              activeTab === 'calendar' ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Calendar
          </button>
          <button 
            onClick={() => switchGlobalTab('ai')} 
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold transition-colors w-[130px] flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai' ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Meet
          </button>
          <button 
            onClick={() => switchGlobalTab('reports')} 
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold transition-colors w-[110px] flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports' ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Reports
          </button>
        </div>

        {/* Right Notifications */}
        <div className="flex items-center gap-4">
          <button 
            onClick={requestNotificationPermission} 
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 flex items-center justify-center text-gray-300 hover:text-white border border-white/10 hover:bg-black/50 transition-all"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden absolute top-0 right-0 w-2.5 h-2.5 bg-accent-red rounded-full shadow-[0_0_8px_#EF4444] animate-pulse border border-black"></span>
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 safe-h-bottom safe-pb bg-black/60 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-[100] px-2">
        <button 
          onClick={() => switchGlobalTab('tasks')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'tasks' ? 'text-accent-yellow' : 'text-gray-400'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Tasks</span>
        </button>
        <button 
          onClick={() => switchGlobalTab('calendar')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'calendar' ? 'text-accent-yellow' : 'text-gray-400'}`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Calendar</span>
        </button>
        <button 
          onClick={() => switchGlobalTab('ai')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'ai' ? 'text-accent-purple' : 'text-gray-400'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">AI Meet</span>
        </button>
        <button 
          onClick={() => switchGlobalTab('reports')}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${activeTab === 'reports' ? 'text-accent-blue' : 'text-gray-400'}`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium">Reports</span>
        </button>
      </nav>
    </>
  );
}

export default Navbar;
