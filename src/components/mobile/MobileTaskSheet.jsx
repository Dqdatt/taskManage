import { useContext, useState } from 'react';
import { Calendar, Check, CheckSquare, ChevronDown, Flag, Link as LinkIcon, Plus, Save, Tag, Trash2, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import MarkdownEditor from '../ui/MarkdownEditor';
import { statusMeta } from './mobileUtils';

function MobileTaskSheet({ taskId, onClose }) {
  const { tasks, updateTask, deleteTask } = useContext(AppContext);
  const [isClosing, setIsClosing] = useState(false);
  const task = tasks.find((item) => item.id === taskId);
  const [formData, setFormData] = useState(() => task ? { ...task, subtasks: task.subtasks || [], links: task.links || [] } : null);
  const [openMenu, setOpenMenu] = useState(null);

  if (!formData) return null;

  const closeSheet = () => {
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveTask = () => {
    updateTask(formData);
    closeSheet();
  };

  const removeTask = () => {
    if (window.confirm('Delete this task?')) {
      deleteTask(taskId);
      closeSheet();
    }
  };

  const updateSubtask = (index, field, value) => {
    const next = [...(formData.subtasks || [])];
    next[index] = { ...next[index], [field]: value };
    setFormData((prev) => ({ ...prev, subtasks: next }));
  };

  const updateLink = (index, field, value) => {
    const next = [...(formData.links || [])];
    next[index] = { ...next[index], [field]: value };
    setFormData((prev) => ({ ...prev, links: next }));
  };

  const meta = statusMeta[formData.status] || statusMeta.todo;
  const statusOptions = Object.entries(statusMeta).map(([value, item]) => ({ value, label: item.label }));
  const typeOptions = [
    { value: '', label: 'None' },
    { value: 'Quay', label: 'Quay' },
    { value: 'Dựng', label: 'Dựng' },
    { value: 'Livestream', label: 'Livestream' },
  ];

  const compactDropdown = ({ id, label, value, options, onSelect }) => {
    const selected = options.find((option) => option.value === value) || options[0];
    const open = openMenu === id;

    return (
      <div className={`mobile-compact-select ${open ? 'mobile-compact-select-open' : ''}`}>
        <button
          type="button"
          className="mobile-select-control"
          onClick={() => setOpenMenu(open ? null : id)}
          aria-expanded={open}
        >
          <span>{label}</span>
          <strong>{selected.label}</strong>
          <ChevronDown className="w-4 h-4" />
        </button>

        {open && (
          <div className="mobile-select-menu">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value || 'none'}
                  type="button"
                  className={`mobile-select-option ${active ? 'mobile-select-option-active' : ''}`}
                  onClick={() => {
                    onSelect(option.value);
                    setOpenMenu(null);
                  }}
                >
                  <span>{option.label}</span>
                  {active && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`mobile-sheet-backdrop ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={closeSheet}>
      <section className={`mobile-task-sheet ${isClosing ? 'translate-y-full' : 'translate-y-0'}`} onClick={(event) => event.stopPropagation()}>
        <div className="mobile-sheet-handle" />
        <div className="mobile-sheet-topbar">
          <span className={`mobile-pill ${meta.tone}`}>{meta.label}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={removeTask} className="mobile-icon-button text-red-200" aria-label="Delete task">
              <Trash2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={closeSheet} className="mobile-icon-button" aria-label="Close task">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mobile-sheet-scroll">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mobile-sheet-title"
            placeholder="Untitled task"
          />

          <section className="mobile-task-properties">
            <div className="mobile-sheet-meta-grid">
              <label className="mobile-field">
                <span><Calendar className="w-3.5 h-3.5" /> Due</span>
                <input type="datetime-local" name="dueDateTime" value={formData.dueDateTime || ''} onChange={handleChange} />
              </label>
              <label className="mobile-field">
                <span><Tag className="w-3.5 h-3.5" /> Source</span>
                <input type="text" name="order" value={formData.order || ''} onChange={handleChange} placeholder="GT, Social..." />
              </label>
              <label className="mobile-field mobile-urgent-field">
                <span><Flag className="w-3.5 h-3.5" /> Urgent</span>
                <input type="checkbox" name="urgent" checked={!!formData.urgent} onChange={handleChange} className="mobile-checkbox" />
              </label>
            </div>

            <div className="mobile-dropdown-grid">
              {compactDropdown({
                id: 'status',
                label: 'Status',
                value: formData.status || 'todo',
                options: statusOptions,
                onSelect: (status) => setFormData((prev) => ({ ...prev, status })),
              })}
              {compactDropdown({
                id: 'type',
                label: 'Type',
                value: formData.taskType || '',
                options: typeOptions,
                onSelect: (taskType) => setFormData((prev) => ({ ...prev, taskType })),
              })}
            </div>
          </section>

          <div className="mt-3">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Description</p>
            <MarkdownEditor
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Notes, context, requirements..."
              style={{ minHeight: '118px' }}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Checklist</p>
              <button type="button" onClick={() => setFormData((prev) => ({ ...prev, subtasks: [...(prev.subtasks || []), { text: '', done: false }] }))} className="mobile-mini-button">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(formData.subtasks || []).map((subtask, index) => (
                <label key={index} className="mobile-inline-edit">
                  <input type="checkbox" checked={!!subtask.done} onChange={(event) => updateSubtask(index, 'done', event.target.checked)} className="mobile-checkbox" />
                  <input type="text" value={subtask.text} onChange={(event) => updateSubtask(index, 'text', event.target.value)} placeholder="To do..." />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Links</p>
              <button type="button" onClick={() => setFormData((prev) => ({ ...prev, links: [...(prev.links || []), { title: '', url: '' }] }))} className="mobile-mini-button">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(formData.links || []).map((link, index) => (
                <div key={index} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <input type="text" value={link.title} onChange={(event) => updateLink(index, 'title', event.target.value)} placeholder="Title" className="mobile-sheet-input" />
                  <input type="url" value={link.url} onChange={(event) => updateLink(index, 'url', event.target.value)} placeholder="https://..." className="mobile-sheet-input" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mobile-sheet-actions">
          <button type="button" onClick={closeSheet} className="mobile-secondary-action">Cancel</button>
          <button type="button" onClick={saveTask} className="mobile-primary-action">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </section>
    </div>
  );
}

export default MobileTaskSheet;
