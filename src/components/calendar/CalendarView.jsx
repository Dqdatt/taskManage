import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function CalendarView() {
  const { tasks, openNewTaskModal, setSelectedTaskId } = useContext(AppContext);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  const prevMonth = () => {
    setActiveMonth(prev => {
      if (prev === 0) {
        setActiveYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const nextMonth = () => {
    setActiveMonth(prev => {
      if (prev === 11) {
        setActiveYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goToCurrentMonth = () => {
    setActiveMonth(new Date().getMonth());
    setActiveYear(new Date().getFullYear());
  };

  const handleDayClick = (day) => {
    const mm = String(activeMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    openNewTaskModal(`${activeYear}-${mm}-${dd}T09:00`);
  };

  const handleTaskClick = (e, taskId) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
  };

  const generateGrid = () => {
    const cells = [];
    const firstDay = new Date(activeYear, activeMonth, 1);
    const lastDay = new Date(activeYear, activeMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    const prevMonthLast = new Date(activeYear, activeMonth, 0).getDate();
    
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push(
        <div key={`prev-${i}`} className="p-2 opacity-20 text-xs font-bold border border-white/5 rounded-2xl bg-black/20">
          {prevMonthLast - i}
        </div>
      );
    }

    const today = new Date().toDateString();

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cDate = new Date(activeYear, activeMonth, d);
      const isToday = cDate.toDateString() === today;
      
      const dTasks = tasks.filter(t => t.dueDateTime && new Date(t.dueDateTime).toDateString() === cDate.toDateString());
      
      cells.push(
        <div 
          key={`day-${d}`} 
          onClick={() => handleDayClick(d)}
          className={`p-2 border rounded-2xl flex flex-col transition-all min-h-[100px] cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/5 ${
            isToday ? 'border-accent-blue/50 bg-accent-blue/10' : 'border-white/5 bg-black/20'
          }`}
        >
          <div className={`font-bold mb-2 ${isToday ? 'text-accent-blue font-extrabold text-sm' : 'text-gray-400'}`}>
            {d}
          </div>
          <div className="flex-1 space-y-1.5 overflow-hidden">
            {dTasks.map(t => {
              let colClass = 'bg-gray-500/20 text-gray-300 border-gray-500/20';
              if (t.status === 'done') colClass = 'bg-accent-green/10 text-accent-green border-accent-green/20 line-through';
              else if (t.urgent) colClass = 'bg-accent-red/20 text-accent-red border-accent-red/50 shadow-[0_0_5px_rgba(239,68,68,0.5)]';
              else if (t.status === 'in-progress') colClass = 'bg-accent-blue/20 text-accent-blue border-accent-blue/20';
              
              return (
                <div 
                  key={t.id} 
                  onClick={(e) => handleTaskClick(e, t.id)}
                  className={`text-[10px] font-bold leading-tight truncate border px-1.5 py-0.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${colClass}`}
                >
                  {t.urgent ? '🚨 ' : ''}{t.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Next month padding
    const totalCells = startDay + daysInMonth;
    const pad = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= pad; d++) {
      cells.push(
        <div key={`next-${d}`} className="p-2 opacity-20 text-xs font-bold border border-white/5 rounded-2xl bg-black/20">
          {d}
        </div>
      );
    }

    return cells;
  };

  const monthYearStr = new Date(activeYear, activeMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* CALENDAR CONTENT BOUNDED BY max-w-7xl */}
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        {/* HEADER */}
        <header className="py-2 mb-2 shrink-0 border-b border-white/10 flex items-center justify-between relative">
          <div className="flex-1"></div>
          <h2 className="text-xl font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2">{monthYearStr}</h2>
          <div className="flex gap-2 items-center">
            <button onClick={goToCurrentMonth} className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:bg-white/10 transition-colors">Today</button>
            <div className="flex bg-black/40 rounded-full border border-white/10 p-0.5">
              <button onClick={prevMonth} className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto pb-4">
          <div className="bg-[rgba(30,45,35,0.45)] backdrop-blur-[8px] border border-white/10 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)] rounded-3xl p-3 md:p-4 w-full min-h-full flex flex-col">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
               <div className="py-2">Mon</div>
               <div className="py-2">Tue</div>
               <div className="py-2">Wed</div>
               <div className="py-2">Thu</div>
               <div className="py-2">Fri</div>
               <div className="py-2 text-accent-blue/70">Sat</div>
               <div className="py-2 text-accent-red/70">Sun</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 flex-1">
              {generateGrid()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CalendarView;
