import { useContext, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, LayoutGrid, Tags } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function MobileReportsPage() {
  const { tasks } = useContext(AppContext);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === 'done').length;
    const doing = tasks.filter((task) => task.status === 'in-progress').length;
    const urgent = tasks.filter((task) => task.urgent && task.status !== 'done').length;
    const planned = total - done - doing;
    const progress = total ? Math.round((done / total) * 100) : 0;

    const typeCounts = tasks.reduce((map, task) => {
      const key = task.taskType || 'Other';
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});

    return {
      total,
      done,
      doing,
      planned,
      urgent,
      progress,
      typeCounts: Object.entries(typeCounts).sort((a, b) => b[1] - a[1]),
    };
  }, [tasks]);

  const cards = [
    { label: 'Total', value: stats.total, icon: LayoutGrid, tone: 'text-sky-200 bg-sky-400/14' },
    { label: 'Doing', value: stats.doing, icon: CircleDashed, tone: 'text-blue-200 bg-blue-400/14' },
    { label: 'Done', value: stats.done, icon: CheckCircle2, tone: 'text-emerald-200 bg-emerald-400/14' },
    { label: 'Urgent', value: stats.urgent, icon: AlertTriangle, tone: 'text-red-200 bg-red-400/14' },
  ];

  return (
    <div className="mobile-page">
      <section className="mobile-report-hero">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-100/60">Progress</p>
          <h2 className="mt-1 text-4xl font-black text-white">{stats.progress}%</h2>
          <p className="mt-1 text-sm text-white/55">{stats.done} of {stats.total} tasks completed</p>
        </div>
        <div className="mobile-progress-ring" style={{ '--progress': `${stats.progress * 3.6}deg` }}>
          <span>{stats.progress}%</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="mobile-stat-card">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">{label}</p>
          </div>
        ))}
      </section>

      <section className="mobile-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/60 flex items-center gap-2">
            <Tags className="w-4 h-4" /> Task mix
          </h3>
          <span className="text-xs text-white/30">{stats.planned} planned</span>
        </div>
        <div className="space-y-3">
          {stats.typeCounts.length === 0 ? (
            <p className="text-sm text-white/45">No task data yet.</p>
          ) : (
            stats.typeCounts.map(([name, count]) => {
              const percent = stats.total ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-bold text-white">{name}</span>
                    <span className="text-white/45">{count} · {percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-yellow-200" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default MobileReportsPage;
