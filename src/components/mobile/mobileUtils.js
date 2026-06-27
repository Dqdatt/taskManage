export const statusMeta = {
  todo: { label: 'Planned', shortLabel: 'Plan', tone: 'text-violet-200 bg-violet-400/15 border-violet-300/20' },
  'in-progress': { label: 'Doing', shortLabel: 'Doing', tone: 'text-sky-200 bg-sky-400/15 border-sky-300/20' },
  done: { label: 'Done', shortLabel: 'Done', tone: 'text-emerald-200 bg-emerald-400/15 border-emerald-300/20' },
};

export const toDateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isTodayTask = (task) => {
  if (!task.dueDateTime) return false;
  return toDateKey(task.dueDateTime) === toDateKey(new Date());
};

export const formatTaskDate = (value) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export const formatTaskTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
