import React from 'react';
import { Calendar, Tag, AlertTriangle, CheckSquare, Link as LinkIcon } from 'lucide-react';

function TaskCard({ task, onClick, onDragStart }) {
  let dateStr = 'Không có hạn';
  let daysLeftStr = '';
  let dateIconColor = 'text-gray-400';
  
  if (task.dueDateTime) {
    const d = new Date(task.dueDateTime);
    dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const dStart = new Date(d).setHours(0,0,0,0);
    const nowStart = new Date().setHours(0,0,0,0);
    const diffDays = Math.ceil((dStart - nowStart) / (1000 * 60 * 60 * 24));
    
    if (task.status !== 'done') {
      if (diffDays < 0) { daysLeftStr = ' | Quá hạn'; dateIconColor = 'text-accent-red'; } 
      else if (diffDays === 0) { daysLeftStr = ' | Hôm nay'; dateIconColor = 'text-accent-yellow'; } 
      else { daysLeftStr = ` | Còn ${diffDays} ngày`; }
    }
  }

  const orderStr = task.order !== undefined && task.order !== '' ? String(task.order) : '';
  
  let cardBaseClass = 'glass-card';
  let titleTextClass = 'text-white';
  
  if (task.status === 'done') {
    cardBaseClass += ' opacity-50 grayscale-[40%]';
    titleTextClass = 'line-through text-gray-400';
  } else if (task.urgent) {
    cardBaseClass = 'glass-urgent rounded-2xl p-4 cursor-grab active:cursor-grabbing border-l-[6px] border-l-accent-red animate-glow-pulse';
  } else {
    // Determine type class
    if (task.taskType === 'Quay') cardBaseClass += ' card-type-quay';
    else if (task.taskType === 'Dựng') cardBaseClass += ' card-type-dung';
    else if (task.taskType === 'Livestream') cardBaseClass += ' card-type-livestream';
    
    // Determine if due today
    if (task.dueDateTime) {
      const d = new Date(task.dueDateTime);
      const dStart = new Date(d).setHours(0,0,0,0);
      const nowStart = new Date().setHours(0,0,0,0);
      const diffDays = Math.ceil((dStart - nowStart) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        cardBaseClass += ' glass-today';
      }
    }
  }

  if (!cardBaseClass.includes('glass-urgent') && !cardBaseClass.includes('glass-today')) {
    cardBaseClass += ' rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors';
  } else if (cardBaseClass.includes('glass-today')) {
    cardBaseClass += ' rounded-2xl p-4 cursor-grab active:cursor-grabbing';
  }

  let subtaskCount = 0;
  let doneSubtaskCount = 0;
  if (task.subtasks && task.subtasks.length > 0) {
    subtaskCount = task.subtasks.length;
    doneSubtaskCount = task.subtasks.filter(s => s.done).length;
  }

  let linkCount = 0;
  if (task.links && task.links.length > 0) {
    linkCount = task.links.length;
  }

  return (
    <div 
      className={`relative ${cardBaseClass}`} 
      onClick={() => onClick(task.id)}
      draggable="true"
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      {task.urgent && task.status !== 'done' && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent-red rounded-full border border-black animate-ping"></div>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent-red rounded-full border border-black shadow-[0_0_8px_#EF4444]"></div>
        </>
      )}
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className={`text-sm font-bold leading-tight pr-2 ${titleTextClass}`}>{task.title}</h3>
      </div>
      
      {(subtaskCount > 0 || linkCount > 0) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {subtaskCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
              <CheckSquare className="w-3 h-3" /> {doneSubtaskCount}/{subtaskCount}
            </div>
          )}
          {linkCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
              <LinkIcon className="w-3 h-3" /> {linkCount}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-medium">
          <Calendar className={`w-3 h-3 ${dateIconColor}`} />
          <span>{dateStr}{daysLeftStr}</span>
        </div>
        
        {task.urgent ? (
          <div className="flex items-center gap-1 bg-accent-red/20 text-accent-red px-2 py-0.5 rounded border border-accent-red/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-3 h-3 fill-current animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">URGENT</span>
          </div>
        ) : orderStr ? (
          <div className="flex items-center gap-1 bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded border border-gray-500/20">
            <Tag className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-wider">{orderStr}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TaskCard;
