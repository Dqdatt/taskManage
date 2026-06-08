import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

function ListView({ tasks, onTaskClick }) {
  const getSortedTasks = () => {
    let filtered = [...tasks];
    filtered.sort((a, b) => {
      if (a.status === 'done' !== (b.status === 'done')) return a.status === 'done' ? 1 : -1;
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      if (!a.dueDateTime) return 1; 
      if (!b.dueDateTime) return -1;
      return new Date(a.dueDateTime) - new Date(b.dueDateTime);
    });
    return filtered;
  };

  const sortedTasks = getSortedTasks();

  if (sortedTasks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-2 w-full h-full flex items-center justify-center">
        <div className="p-8 text-center text-gray-400 text-sm">No tasks found.</div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-2 w-full">
      <div className="grid grid-cols-[1fr_150px_120px_100px] gap-4 p-4 border-b border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        <div>Task Name</div>
        <div>Status</div>
        <div>Due Date</div>
        <div className="text-right">Actions</div>
      </div>
      
      <div className="flex flex-col">
        {sortedTasks.map(t => {
          let dateStr = '-';
          if (t.dueDateTime) {
             dateStr = new Date(t.dueDateTime).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'});
          }

          const statusMap = {
            'todo': { label: 'Planned', class: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' },
            'in-progress': { label: 'In Progress', class: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30' },
            'done': { label: 'Completed', class: 'bg-accent-green/20 text-accent-green border-accent-green/30' }
          };
          const st = statusMap[t.status];

          const isUrgentActive = t.urgent && t.status !== 'done';
          const isDone = t.status === 'done';
          
          let typeClass = '';
          if (!isDone && t.taskType) {
            if (t.taskType === 'Quay') typeClass = 'card-type-quay';
            else if (t.taskType === 'Dựng') typeClass = 'card-type-dung';
            else if (t.taskType === 'Livestream') typeClass = 'card-type-livestream';
          }
          
          let todayClass = '';
          if (!isDone && t.dueDateTime) {
            const dStart = new Date(t.dueDateTime).setHours(0,0,0,0);
            const nowStart = new Date().setHours(0,0,0,0);
            if (Math.ceil((dStart - nowStart) / (1000 * 60 * 60 * 24)) === 0) {
               todayClass = 'glass-today rounded-lg';
            }
          }

          return (
            <div 
              key={t.id}
              onClick={() => onTaskClick(t.id)}
              className={`cursor-pointer grid grid-cols-[1fr_150px_120px_100px] gap-4 p-4 items-center border-b border-white/5 hover:bg-white/10 transition-colors group ${isDone ? 'opacity-50' : ''} ${isUrgentActive ? 'bg-accent-red/10 border-l-4 border-l-accent-red rounded-lg' : ''} ${!isUrgentActive ? typeClass : ''} ${!isUrgentActive ? todayClass : ''}`}
            >
              <div className="flex items-center gap-3 truncate pr-4">
                {isUrgentActive ? (
                  <AlertTriangle className="w-4 h-4 text-accent-red animate-pulse shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0"></div>
                )}
                <div className="truncate">
                  <div className={`font-bold text-sm text-white truncate ${isDone ? 'line-through text-gray-400' : ''}`}>
                    {t.title}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {t.order ? `${t.order} • ` : ''}{t.description}
                  </div>
                </div>
              </div>
              
              <div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${st.class}`}>
                  {st.label}
                </span>
              </div>
              
              <div className="text-xs text-gray-300 font-mono">{dateStr}</div>
              
              <div className="text-right flex items-center justify-end gap-2 text-gray-400 group-hover:text-white transition-colors">
                 <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListView;
