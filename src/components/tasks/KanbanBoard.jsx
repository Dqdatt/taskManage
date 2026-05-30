import React, { useContext, useState } from 'react';
import TaskCard from './TaskCard';
import { AppContext } from '../../context/AppContext';

function KanbanBoard({ tasks, onTaskClick }) {
  const { updateTask } = useContext(AppContext);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // e.target.classList.add('opacity-50', 'scale-95'); // Handled by standard HTML5 visual feedback or React state if needed
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = (e, status) => {
    if (dragOverCol === status) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedTaskId) {
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.status !== status) {
        const updatedTask = { ...task, status: status, completed: (status === 'done') };
        updateTask(updatedTask);
      }
    }
    setDraggedTaskId(null);
  };

  const getSortedTasks = (status) => {
    let colTasks = tasks.filter(t => t.status === status);
    colTasks.sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      if (!a.dueDateTime && !b.dueDateTime) return 0;
      if (!a.dueDateTime) return 1;
      if (!b.dueDateTime) return -1;
      return new Date(a.dueDateTime) - new Date(b.dueDateTime);
    });
    return colTasks;
  };

  const columns = [
    { id: 'todo', label: 'Planned', colorClass: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' },
    { id: 'in-progress', label: 'In progress', colorClass: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30' },
    { id: 'done', label: 'Completed', colorClass: 'bg-accent-green/20 text-accent-green border-accent-green/30' }
  ];

  return (
    <div className="flex gap-6 h-full min-w-max pr-4">
      {columns.map(col => {
        const colTasks = getSortedTasks(col.id);
        const isDragOver = dragOverCol === col.id;
        
        return (
          <div 
            key={col.id}
            className={`flex-1 flex flex-col h-full kanban-column min-w-[320px] transition-all duration-200 ${isDragOver ? 'bg-white/5 rounded-[1.5rem]' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${col.colorClass}`}>
                {col.label}
              </span>
              <span className="text-xs font-bold text-gray-400 bg-black/40 px-2 py-1 rounded-full border border-white/10">
                {colTasks.length}
              </span>
            </div>
            
            {/* Added extra horizontal padding/margin to prevent urgent task glow clipping */}
            <div className="flex-1 overflow-y-auto space-y-4 pt-4 -mt-4 pb-4 px-4 -mx-4 task-list">
              {colTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={onTaskClick} 
                  onDragStart={handleDragStart} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
