import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

function CalendarView() {
  const { tasks, openNewTaskModal, setSelectedTaskId } = useContext(AppContext);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

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
    const now = new Date();
    setActiveMonth(now.getMonth());
    setActiveYear(now.getFullYear());
    setSelectedDate(now.toDateString());
  };

  const handleDayClick = (dDateStr) => {
    setSelectedDate(dDateStr);
  };

  const handleDoubleDayClick = (day) => {
    const mm = String(activeMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    openNewTaskModal(`${activeYear}-${mm}-${dd}T09:00`);
  };

  const handleTaskClick = (e, taskId) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
  };

  const getDotColorClass = (t) => {
    if (t.status === 'done') return 'bg-accent-green shadow-[0_0_5px_rgba(34,197,94,0.5)]';
    if (t.urgent) return 'bg-accent-red shadow-[0_0_5px_rgba(239,68,68,0.5)]';
    if (t.taskType === 'Quay') return 'bg-orange-400';
    if (t.taskType === 'Dựng') return 'bg-blue-400';
    if (t.taskType === 'Livestream') return 'bg-pink-400';
    if (t.status === 'in-progress') return 'bg-accent-blue shadow-[0_0_5px_rgba(56,189,248,0.5)]';
    return 'bg-gray-400';
  };

  const getPillColorClass = (t) => {
    if (t.status === 'done') return 'bg-accent-green/10 text-accent-green border-accent-green/20 line-through';
    if (t.urgent) return 'bg-accent-red/20 text-accent-red border-accent-red/50 shadow-[0_0_5px_rgba(239,68,68,0.5)]';
    if (t.taskType === 'Quay') return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (t.taskType === 'Dựng') return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    if (t.taskType === 'Livestream') return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
    if (t.status === 'in-progress') return 'bg-accent-blue/20 text-accent-blue border-accent-blue/20';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/20';
  };

  const generateDesktopGrid = () => {
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
          onClick={() => {
            const mm = String(activeMonth + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            openNewTaskModal(`${activeYear}-${mm}-${dd}T09:00`);
          }}
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
              else if (t.taskType === 'Quay') colClass = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
              else if (t.taskType === 'Dựng') colClass = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
              else if (t.taskType === 'Livestream') colClass = 'bg-pink-500/20 text-pink-400 border-pink-500/40';
              else if (t.status === 'in-progress') colClass = 'bg-accent-blue/20 text-accent-blue border-accent-blue/20';
              
              if (isToday && t.status !== 'done' && !t.urgent) {
                colClass += ' border-yellow-400 shadow-[0_0_8px_rgba(253,224,71,0.5)]';
              }
              
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

  const generateMobileGrid = () => {
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
        <div key={`prev-${i}`} className="p-1 opacity-20 text-[10px] font-bold border-b border-white/5 bg-transparent flex flex-col items-center pt-2 min-h-[60px]">
          {prevMonthLast - i}
        </div>
      );
    }

    const todayStr = new Date().toDateString();

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cDate = new Date(activeYear, activeMonth, d);
      const cDateStr = cDate.toDateString();
      const isToday = cDateStr === todayStr;
      const isSelected = cDateStr === selectedDate;
      
      const dTasks = tasks.filter(t => t.dueDateTime && new Date(t.dueDateTime).toDateString() === cDateStr);
      
      cells.push(
        <div 
          key={`day-${d}`} 
          onClick={() => handleDayClick(cDateStr)}
          onDoubleClick={() => handleDoubleDayClick(d)}
          className={`p-0.5 border-b border-white/5 flex flex-col transition-all cursor-pointer min-h-[60px] hover:bg-white/5 ${
            isSelected ? 'bg-white/5' : 'bg-transparent'
          }`}
        >
          {/* Day Number */}
          <div className={`font-bold mb-1 flex items-center justify-center pt-1 ${isToday ? 'text-white font-black text-sm' : isSelected ? 'text-accent-yellow' : 'text-gray-300'}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-accent-red text-white' : ''}`}>
              {d}
            </span>
          </div>
          
          {/* TASKS (Mobile micro-pills with background color) */}
          <div className="flex-1 flex-col space-y-0.5 overflow-hidden w-full px-0.5">
            {dTasks.slice(0, 3).map(t => {
              let colClass = getPillColorClass(t);
              if (isToday && t.status !== 'done' && !t.urgent) {
                colClass += ' border-yellow-400 shadow-[0_0_8px_rgba(253,224,71,0.5)]';
              }
              return (
                <div 
                  key={t.id} 
                  onClick={(e) => handleTaskClick(e, t.id)}
                  className={`text-[8px] font-bold leading-tight truncate border px-1 py-[2px] rounded cursor-pointer hover:opacity-80 transition-opacity w-full ${colClass}`}
                >
                  {t.urgent ? '🚨 ' : ''}{t.title}
                </div>
              );
            })}
            {dTasks.length > 3 && (
              <div className="text-[8px] text-gray-500 font-bold pl-1">
                +{dTasks.length - 3}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Next month padding
    const totalCells = startDay + daysInMonth;
    const pad = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= pad; d++) {
      cells.push(
        <div key={`next-${d}`} className="p-1 opacity-20 text-[10px] font-bold border-b border-white/5 bg-transparent flex flex-col items-center pt-2 min-h-[60px]">
          {d}
        </div>
      );
    }

    return cells;
  };

  const monthYearStr = new Date(activeYear, activeMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Tasks for the selected date (for Mobile Agenda View)
  const selectedDateTasks = tasks.filter(t => t.dueDateTime && new Date(t.dueDateTime).toDateString() === selectedDate);
  const parsedSelectedDate = new Date(selectedDate);
  const formattedSelectedDate = `${parsedSelectedDate.getDate()} ${parsedSelectedDate.toLocaleDateString('en-US', { month: 'short' })}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out] relative">
      {/* CALENDAR CONTENT BOUNDED BY max-w-7xl */}
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col md:px-0">
        
        {/* HEADER */}
        <header className="py-2 mb-2 shrink-0 border-b border-white/10 flex items-center justify-between relative px-2 sm:px-6 md:px-0">
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
        <main className="flex-1 overflow-y-auto pb-6 md:pb-4 flex flex-col gap-4 px-2 sm:px-6 md:px-0">
          
          {/* GRID */}
          <div className="bg-[rgba(30,45,35,0.45)] backdrop-blur-[8px] border border-white/10 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)] rounded-2xl md:rounded-3xl p-2 md:p-4 w-full shrink-0 md:min-h-full md:flex md:flex-col">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
               <div className="py-1 md:py-2">Mon</div>
               <div className="py-1 md:py-2">Tue</div>
               <div className="py-1 md:py-2">Wed</div>
               <div className="py-1 md:py-2">Thu</div>
               <div className="py-1 md:py-2">Fri</div>
               <div className="py-1 md:py-2 text-accent-blue/70">Sat</div>
               <div className="py-1 md:py-2 text-accent-red/70">Sun</div>
            </div>
            
            {/* MOBILE GRID */}
            <div className="grid md:hidden grid-cols-7 gap-1.5">
              {generateMobileGrid()}
            </div>
            
            {/* DESKTOP GRID */}
            <div className="hidden md:grid grid-cols-7 gap-2 flex-1">
              {generateDesktopGrid()}
            </div>
          </div>

          {/* MOBILE AGENDA VIEW (Hidden on Desktop) */}
          <div className="md:hidden glass-card rounded-3xl p-5 border border-white/10 shadow-lg flex-1 min-h-[200px] flex flex-col mb-16">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-accent-yellow" /> 
                Agenda for {formattedSelectedDate}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {selectedDateTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-8">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center mb-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[13px] text-gray-400">No tasks scheduled for this day.</p>
                </div>
              ) : (
                selectedDateTasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={(e) => handleTaskClick(e, t.id)}
                    className={`p-3 rounded-2xl border cursor-pointer hover:scale-[1.02] active:scale-95 transition-all ${getPillColorClass(t)} bg-opacity-30`}
                  >
                    <div className="text-xs font-bold truncate">{t.urgent ? '🚨 ' : ''}{t.title}</div>
                    <div className="text-[10px] opacity-70 mt-1 capitalize">{t.taskType || 'No Type'} • {t.status}</div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => {
                const mm = String(parsedSelectedDate.getMonth() + 1).padStart(2, '0');
                const dd = String(parsedSelectedDate.getDate()).padStart(2, '0');
                const yyyy = parsedSelectedDate.getFullYear();
                openNewTaskModal(`${yyyy}-${mm}-${dd}T09:00`);
              }}
              className="mt-4 w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Task to this Date
            </button>
          </div>
          
        </main>
      </div>
    </div>
  );
}

export default CalendarView;
