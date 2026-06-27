import { useContext, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle2, Circle, Clock3, Link as LinkIcon, Plus, Search } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { formatTaskDate, formatTaskTime, isTodayTask, statusMeta } from './mobileUtils';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'Planned' },
  { id: 'in-progress', label: 'Doing' },
  { id: 'done', label: 'Done' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'today', label: 'Today' },
];

function MobileTaskCard({ task, onClick }) {
  const meta = statusMeta[task.status] || statusMeta.todo;
  const done = task.status === 'done';
  const subtaskTotal = task.subtasks?.length || 0;
  const subtaskDone = task.subtasks?.filter((item) => item.done).length || 0;
  const linkTotal = task.links?.length || 0;

  return (
    <button
      type="button"
      onClick={() => onClick(task.id)}
      className={`mobile-task-card ${task.urgent && !done ? 'mobile-task-card-urgent' : ''} ${done ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`mobile-pill ${meta.tone}`}>{meta.label}</span>
            {task.urgent && (
              <span className="mobile-pill text-red-100 bg-red-500/20 border-red-300/30">
                <AlertTriangle className="w-3 h-3" /> Urgent
              </span>
            )}
            {isTodayTask(task) && !done && (
              <span className="mobile-pill text-yellow-100 bg-yellow-400/20 border-yellow-200/30">Today</span>
            )}
          </div>
          <h2 className={`text-[16px] font-extrabold leading-snug text-left ${done ? 'line-through text-white/60' : 'text-white'}`}>
            {task.title}
          </h2>
          {task.description && (
            <p className="mt-2 line-clamp-2 text-left text-[13px] leading-relaxed text-white/60">{task.description}</p>
          )}
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0">
          {done ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Circle className="w-5 h-5 text-white/45" />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-white/60">
        <span className="flex items-center gap-1.5 min-w-0">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-yellow-200/80" />
          <span className="truncate">{formatTaskDate(task.dueDateTime)}</span>
          {formatTaskTime(task.dueDateTime) && <span className="text-white/30">{formatTaskTime(task.dueDateTime)}</span>}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {subtaskTotal > 0 && (
            <span className="flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" /> {subtaskDone}/{subtaskTotal}
            </span>
          )}
          {linkTotal > 0 && (
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> {linkTotal}
            </span>
          )}
        </span>
      </div>
    </button>
  );
}

function MobileTasksPage() {
  const { tasks, openNewTaskModal, setSelectedTaskId } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks
      .filter((task) => {
        if (!normalizedQuery) return true;
        return `${task.title || ''} ${task.description || ''} ${task.order || ''}`.toLowerCase().includes(normalizedQuery);
      })
      .filter((task) => {
        if (filter === 'all') return true;
        if (filter === 'urgent') return task.urgent;
        if (filter === 'today') return isTodayTask(task);
        return task.status === filter;
      })
      .sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        if (!a.dueDateTime && !b.dueDateTime) return 0;
        if (!a.dueDateTime) return 1;
        if (!b.dueDateTime) return -1;
        return new Date(a.dueDateTime) - new Date(b.dueDateTime);
      });
  }, [filter, query, tasks]);

  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const doingCount = tasks.filter((task) => task.status === 'in-progress').length;

  return (
    <div className="mobile-page">
      <section className="mobile-summary-strip">
        <div>
          <span>{tasks.length}</span>
          <p>Total</p>
        </div>
        <div>
          <span>{doingCount}</span>
          <p>Doing</p>
        </div>
        <div>
          <span>{completedCount}</span>
          <p>Done</p>
        </div>
      </section>

      <label className="mobile-search">
        <Search className="w-5 h-5 text-white/45" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks"
        />
      </label>

      <div className="mobile-chip-row" aria-label="Task filters">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`mobile-chip ${filter === item.id ? 'mobile-chip-active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="mobile-empty-state">
            <p className="text-sm font-bold text-white">No tasks found</p>
            <p className="mt-1 text-xs text-white/50">Create a new task or change the filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <MobileTaskCard key={task.id} task={task} onClick={setSelectedTaskId} />
          ))
        )}
      </section>

      <button
        type="button"
        onClick={() => openNewTaskModal()}
        className="mobile-fab"
        aria-label="Create task"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}

export default MobileTasksPage;
