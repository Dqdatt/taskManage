import React, { useContext, useState } from 'react';
import { Search, Kanban, List, Plus, BarChart2, Edit3, BookOpen } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import KanbanBoard from './KanbanBoard';
import ListView from './ListView';

function TasksView() {
  const { currentTaskView, switchTaskView, tasks, openNewTaskModal, setSelectedTaskId } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [scratchpad, setScratchpad] = useState(localStorage.getItem('novatask_scratchpad') || '');

  const handleScratchpadChange = (e) => {
    setScratchpad(e.target.value);
    localStorage.setItem('novatask_scratchpad', e.target.value);
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* Header Actions */}
      <header className="px-6 lg:px-8 py-2 shrink-0 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Tasks</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-yellow transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 pr-4 py-2.5 rounded-full text-sm w-48 focus:w-64 transition-all" 
            />
          </div>
          
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md ml-auto lg:ml-2">
            <button 
              onClick={() => switchTaskView('kanban')} 
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${currentTaskView === 'kanban' ? 'view-toggle-active' : 'view-toggle-inactive'}`}
            >
              <Kanban className="w-4 h-4" /> Kanban
            </button>
            <button 
              onClick={() => switchTaskView('list')} 
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${currentTaskView === 'list' ? 'view-toggle-active' : 'view-toggle-inactive'}`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>

          <button 
            onClick={() => openNewTaskModal()} 
            className="bg-accent-yellow hover:bg-yellow-400 text-black px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New task
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {/* KANBAN VIEW */}
        <div className={`absolute inset-0 flex h-full px-8 pb-8 pt-2 transition-opacity duration-300 gap-8 ${currentTaskView === 'kanban' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <KanbanBoard tasks={filteredTasks} onTaskClick={setSelectedTaskId} />
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-80 shrink-0 h-full flex flex-col gap-6 overflow-y-auto pr-2 hidden xl:flex">
            <div className="glass-card rounded-3xl p-5 border border-white/10 shrink-0">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Overall Progress
              </h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-black text-white">{progressPercent}%</span>
                <span className="text-xs text-gray-400 mb-1">{completedCount} / {tasks.length} tasks</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2.5 mb-1 overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-accent-blue to-accent-green h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-white/10 flex-1 flex flex-col overflow-hidden group relative">
              <div className="absolute right-4 top-4 text-gray-600 group-focus-within:text-accent-yellow transition-colors">
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Quick Scratchpad
              </h3>
              <textarea 
                className="flex-1 bg-transparent w-full text-sm text-gray-300 resize-none outline-none placeholder-gray-600 leading-relaxed" 
                placeholder="Jot down quick ideas, timestamps, or script notes here..."
                value={scratchpad}
                onChange={handleScratchpadChange}
              ></textarea>
            </div>
          </aside>
        </div>

        {/* LIST VIEW */}
        <div className={`absolute inset-0 overflow-y-auto px-8 pb-8 pt-2 transition-opacity duration-300 ${currentTaskView === 'list' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ListView tasks={filteredTasks} onTaskClick={setSelectedTaskId} />
        </div>
      </main>
    </div>
  );
}

export default TasksView;
