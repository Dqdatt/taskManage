import { useContext, useState } from 'react';
import { Calendar, CheckSquare, Flag, Link as LinkIcon, Plus, Save, Tag, Trash2, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import MarkdownEditor from '../ui/MarkdownEditor';
import { statusMeta } from './mobileUtils';

function MobileTaskSheet({ taskId, onClose }) {
  const { tasks, updateTask, deleteTask } = useContext(AppContext);
  const [isClosing, setIsClosing] = useState(false);
  const task = tasks.find((item) => item.id === taskId);
  const [formData, setFormData] = useState(() => task ? { ...task, subtasks: task.subtasks || [], links: task.links || [] } : null);

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

  return (
    <div className={`mobile-sheet-backdrop ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={closeSheet}>
      <section className={`mobile-task-sheet ${isClosing ? 'translate-y-full' : 'translate-y-0'}`} onClick={(event) => event.stopPropagation()}>
        <div className="mobile-sheet-handle" />
        <div className="flex items-center justify-between gap-3 px-5 pb-4">
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
          <textarea
            name="title"
            value={formData.title}
            onChange={handleChange}
            rows="2"
            className="w-full resize-none bg-transparent text-2xl font-black leading-tight text-white outline-none placeholder:text-white/25"
            placeholder="Untitled task"
          />

          <div className="mt-5 grid gap-3">
            <label className="mobile-field">
              <span><Calendar className="w-4 h-4" /> Due date</span>
              <input type="datetime-local" name="dueDateTime" value={formData.dueDateTime || ''} onChange={handleChange} />
            </label>
            <label className="mobile-field">
              <span><Tag className="w-4 h-4" /> Source / order</span>
              <input type="text" name="order" value={formData.order || ''} onChange={handleChange} placeholder="GT, Social..." />
            </label>
            <label className="mobile-field">
              <span><Flag className="w-4 h-4" /> Urgent</span>
              <input type="checkbox" name="urgent" checked={!!formData.urgent} onChange={handleChange} className="mobile-checkbox" />
            </label>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(statusMeta).map(([status, item]) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status }))}
                  className={`mobile-segment ${formData.status === status ? 'mobile-segment-active' : ''}`}
                >
                  {item.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Type</p>
            <div className="flex flex-wrap gap-2">
              {['', 'Quay', 'Dựng', 'Livestream'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, taskType: type }))}
                  className={`mobile-chip ${formData.taskType === type ? 'mobile-chip-active' : ''}`}
                >
                  {type || 'None'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Description</p>
            <MarkdownEditor
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Notes, context, requirements..."
              style={{ minHeight: '160px' }}
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
