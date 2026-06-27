import { useContext, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { formatTaskTime, statusMeta, toDateKey } from './mobileUtils';

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function MobileCalendarPage() {
  const { tasks, openNewTaskModal, setSelectedTaskId } = useContext(AppContext);
  const today = new Date();
  const [visibleDate, setVisibleDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(toDateKey(today));

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const cells = useMemo(() => buildMonthCells(year, month), [month, year]);
  const monthLabel = visibleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const tasksByDate = useMemo(() => {
    return tasks.reduce((map, task) => {
      const key = toDateKey(task.dueDateTime);
      if (!key) return map;
      map[key] = [...(map[key] || []), task];
      return map;
    }, {});
  }, [tasks]);

  const selectedTasks = tasksByDate[selectedKey] || [];
  const selectedDate = new Date(`${selectedKey}T12:00:00`);

  const changeMonth = (delta) => {
    setVisibleDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const addForSelectedDate = () => {
    openNewTaskModal(`${selectedKey}T09:00`);
  };

  return (
    <div className="mobile-page">
      <section className="mobile-calendar-card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button type="button" onClick={() => changeMonth(-1)} className="mobile-icon-button" aria-label="Previous month">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-white">{monthLabel}</h2>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setVisibleDate(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedKey(toDateKey(now));
              }}
              className="text-xs font-bold text-yellow-100/80"
            >
              Today
            </button>
          </div>
          <button type="button" onClick={() => changeMonth(1)} className="mobile-icon-button" aria-label="Next month">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-white/30">
          {weekDays.map((day, index) => (
            <div key={`${day}-${index}`} className="py-1">{day}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) return <div key={`blank-${index}`} className="aspect-square" />;
            const key = toDateKey(date);
            const dayTasks = tasksByDate[key] || [];
            const selected = key === selectedKey;
            const isToday = key === toDateKey(today);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`mobile-calendar-day ${selected ? 'mobile-calendar-day-selected' : ''} ${isToday ? 'mobile-calendar-day-today' : ''}`}
              >
                <span>{date.getDate()}</span>
                {dayTasks.length > 0 && (
                  <div className="mt-1 flex justify-center gap-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <i key={task.id} className={`h-1.5 w-1.5 rounded-full ${task.urgent ? 'bg-red-300' : task.status === 'done' ? 'bg-emerald-300' : 'bg-yellow-200'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mobile-agenda">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Selected day</p>
            <h3 className="text-lg font-black text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
          </div>
          <button type="button" onClick={addForSelectedDate} className="mobile-mini-button">
            <Plus className="w-4 h-4" /> Task
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="mobile-empty-state">
            <CalendarDays className="mx-auto mb-2 h-7 w-7 text-white/30" />
            <p className="text-sm font-bold text-white">No tasks for this day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task) => {
              const meta = statusMeta[task.status] || statusMeta.todo;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className="mobile-agenda-item"
                >
                  <span className={`mobile-pill ${meta.tone}`}>{meta.shortLabel}</span>
                  <span className="min-w-0 flex-1 text-left">
                    <strong className="block truncate text-sm text-white">{task.title}</strong>
                    <small className="text-xs text-white/45">{formatTaskTime(task.dueDateTime) || 'All day'}</small>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default MobileCalendarPage;
