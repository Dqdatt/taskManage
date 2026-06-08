import React, { useContext } from 'react';
import { Layers, Sparkles, Bell, Orbit } from 'lucide-react';
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
    <nav className="h-20 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-yellow flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
          <Orbit className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Orbit</span>
      </div>

      {/* Center Tabs (Global Navigation) with Sliding Pill Effect */}
      <div className="flex relative bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md items-center shadow-inner shrink-0 mx-2 sm:mx-0">
        {/* Sliding pill */}
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

      {/* Right Profile & Notifications */}
      <div className="flex items-center gap-4">
        <button 
          onClick={requestNotificationPermission} 
          className="relative w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-gray-300 hover:text-white border border-white/10 hover:bg-black/50 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="hidden absolute top-0 right-0 w-2.5 h-2.5 bg-accent-red rounded-full shadow-[0_0_8px_#EF4444] animate-pulse border border-black"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
