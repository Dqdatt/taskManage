import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { Layers, TrendingUp, TrendingDown, CheckCircle2, ListTodo, BarChart, AlertCircle, Clock, Activity, Target } from 'lucide-react';

const CircularProgress = ({ percentage, colorClass }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
        <circle 
          cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          className={`transition-all duration-1000 ease-out ${colorClass}`} strokeLinecap="round" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{percentage}%</span>
      </div>
    </div>
  );
};

function ReportView() {
  const { tasks } = useContext(AppContext);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth < 0) {
      lastMonth = 11;
      lastMonthYear = currentYear - 1;
    }

    let currentTotal = 0;
    let currentDone = 0;
    let lastTotal = 0;
    let lastDone = 0;
    
    let currentTodo = 0;
    let currentInProgress = 0;
    let currentOverdue = 0;
    let currentUrgent = 0;
    
    const currentTypeCount = { 'Quay': 0, 'Dựng': 0, 'Livestream': 0, 'Other': 0 };

    tasks.forEach(t => {
      // Global Active Stats
      let isOverdue = false;
      if (t.dueDateTime && t.status !== 'done') {
        const dStart = new Date(t.dueDateTime).setHours(0,0,0,0);
        const nowStart = new Date().setHours(0,0,0,0);
        if (dStart < nowStart) {
          isOverdue = true;
        }
      }

      if (t.urgent && t.status !== 'done') currentUrgent++;
      if (isOverdue) currentOverdue++;

      // Monthly Stats
      if (!t.dateCreated) return;
      const d = new Date(t.dateCreated);
      const m = d.getMonth();
      const y = d.getFullYear();

      if (m === currentMonth && y === currentYear) {
        currentTotal++;
        if (t.status === 'done') currentDone++;
        else if (t.status === 'in-progress') currentInProgress++;
        else currentTodo++;
        
        if (t.taskType === 'Quay') currentTypeCount['Quay']++;
        else if (t.taskType === 'Dựng') currentTypeCount['Dựng']++;
        else if (t.taskType === 'Livestream') currentTypeCount['Livestream']++;
        else currentTypeCount['Other']++;
      } else if (m === lastMonth && y === lastMonthYear) {
        lastTotal++;
        if (t.status === 'done') lastDone++;
      }
    });

    const calculatePercent = (current, last) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - last) / last) * 100);
    };

    return {
      currentTotal, lastTotal, totalPercent: calculatePercent(currentTotal, lastTotal),
      currentDone, lastDone, donePercent: calculatePercent(currentDone, lastDone),
      currentTodo, currentInProgress, currentOverdue, currentUrgent,
      currentTypeCount,
      monthName: now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    };
  }, [tasks]);

  const renderTrend = (percent) => {
    if (percent === 0) return <span className="text-gray-400 flex items-center gap-1 text-xs">No change</span>;
    if (percent > 0) return <span className="text-accent-green flex items-center gap-1 text-xs"><TrendingUp className="w-3 h-3" /> +{percent}%</span>;
    return <span className="text-accent-red flex items-center gap-1 text-xs"><TrendingDown className="w-3 h-3" /> {percent}%</span>;
  };

  const completionRate = stats.currentTotal > 0 ? Math.round((stats.currentDone / stats.currentTotal) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      <header className="px-6 lg:px-8 py-2 shrink-0 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent-blue" /> Report Dashboard - {stats.monthName}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Created */}
            <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden group border border-white/10">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl"></div>
              <div className="absolute top-0 right-0 p-6 opacity-10 text-accent-blue group-hover:scale-110 transition-transform">
                 <ListTodo className="w-16 h-16" />
              </div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-accent-blue" /> Total Tasks
              </h3>
              <div className="text-5xl font-black text-white mb-4 relative z-10">{stats.currentTotal}</div>
              <div className="flex items-center gap-2 mt-auto relative z-10 bg-black/30 w-max px-3 py-1.5 rounded-full border border-white/5">
                {renderTrend(stats.totalPercent)}
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">vs last month ({stats.lastTotal})</span>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden group border border-white/10">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-accent-green/10 rounded-full blur-3xl"></div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-accent-green" /> Completion Rate
              </h3>
              <div className="flex items-center justify-between mt-2">
                <div>
                   <div className="text-3xl font-black text-white">{stats.currentDone} <span className="text-lg text-gray-500 font-bold">/ {stats.currentTotal}</span></div>
                   <div className="text-sm font-medium text-gray-400 mt-1">Tasks Completed</div>
                </div>
                <CircularProgress percentage={completionRate} colorClass="text-accent-green" />
              </div>
            </div>

            {/* Urgent & Overdue */}
            <div className="glass-urgent rounded-3xl p-6 flex flex-col relative overflow-hidden group border border-red-500/30">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-accent-red/20 rounded-full blur-3xl"></div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Action Required
              </h3>
              <div className="flex gap-4 mt-auto relative z-10">
                <div className="flex-1 bg-black/30 rounded-2xl p-3 border border-red-500/20 text-center">
                   <div className="text-3xl font-black text-white">{stats.currentOverdue}</div>
                   <div className="text-[10px] text-red-300 font-bold uppercase mt-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3"/> Overdue</div>
                </div>
                <div className="flex-1 bg-black/30 rounded-2xl p-3 border border-red-500/20 text-center">
                   <div className="text-3xl font-black text-white">{stats.currentUrgent}</div>
                   <div className="text-[10px] text-red-300 font-bold uppercase mt-1 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3"/> Urgent</div>
                </div>
              </div>
            </div>

          </div>

          {/* Status Pipeline */}
          <div className="glass-card rounded-3xl p-6 border border-white/10">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" /> Status Pipeline (This Month)
             </h3>
             
             {/* The progress bar */}
             <div className="h-4 flex rounded-full overflow-hidden mb-6 bg-gray-800 border border-white/5 shadow-inner">
                <div style={{ width: `${stats.currentTotal ? (stats.currentTodo / stats.currentTotal) * 100 : 0}%` }} className="bg-gray-500 hover:brightness-110 transition-all"></div>
                <div style={{ width: `${stats.currentTotal ? (stats.currentInProgress / stats.currentTotal) * 100 : 0}%` }} className="bg-accent-blue hover:brightness-110 transition-all"></div>
                <div style={{ width: `${stats.currentTotal ? (stats.currentDone / stats.currentTotal) * 100 : 0}%` }} className="bg-accent-green hover:brightness-110 transition-all"></div>
             </div>
             
             {/* Legend */}
             <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">To Do</span>
                   </div>
                   <div className="text-2xl font-black text-white">{stats.currentTodo}</div>
                </div>
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-blue"></div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">In Progress</span>
                   </div>
                   <div className="text-2xl font-black text-white">{stats.currentInProgress}</div>
                </div>
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent-green"></div>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Done</span>
                   </div>
                   <div className="text-2xl font-black text-white">{stats.currentDone}</div>
                </div>
             </div>
          </div>

          {/* Task Types Breakdown */}
          <div className="glass-card rounded-3xl p-6 border border-white/10">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-orange-400" /> Types Breakdown (This Month)
             </h3>
             <div className="space-y-5">
                {[
                  { name: 'Quay', count: stats.currentTypeCount['Quay'], color: 'bg-orange-500' },
                  { name: 'Dựng', count: stats.currentTypeCount['Dựng'], color: 'bg-blue-500' },
                  { name: 'Livestream', count: stats.currentTypeCount['Livestream'], color: 'bg-pink-500' },
                  { name: 'Other', count: stats.currentTypeCount['Other'], color: 'bg-gray-500' }
                ].sort((a,b) => b.count - a.count).map(type => {
                   const typePercent = stats.currentTotal > 0 ? Math.round((type.count / stats.currentTotal) * 100) : 0;
                   return (
                     <div key={type.name} className="flex items-center gap-3 sm:gap-4 group">
                        <div className="w-20 sm:w-24 text-xs sm:text-sm font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-wider">{type.name}</div>
                        <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                           <div className={`h-full ${type.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${typePercent}%` }}></div>
                        </div>
                        <div className="w-16 sm:w-20 text-right text-sm font-bold text-white">{type.count} <span className="text-gray-500 text-xs font-medium">({typePercent}%)</span></div>
                     </div>
                   )
                })}
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default ReportView;

