import React, { useContext, useState, useEffect } from 'react';
import { ChevronRight, Trash2, Calendar, Tag, Flame, AlignLeft, CheckSquare, Plus, Link as LinkIcon, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function TaskDrawer({ taskId, onClose }) {
  const { tasks, updateTask, deleteTask } = useContext(AppContext);
  const task = tasks.find(t => t.id === taskId);
  
  const [formData, setFormData] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    }
  }, [task]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubtaskChange = (index, field, value) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks[index] = { ...newSubtasks[index], [field]: value };
    setFormData({ ...formData, subtasks: newSubtasks });
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, links: newLinks });
  };

  const addSubtask = () => {
    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), { text: '', done: false }]
    });
  };

  const removeSubtask = (index) => {
    const newSubtasks = [...formData.subtasks];
    newSubtasks.splice(index, 1);
    setFormData({ ...formData, subtasks: newSubtasks });
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...(formData.links || []), { title: '', url: '' }]
    });
  };

  const removeLink = (index) => {
    const newLinks = [...formData.links];
    newLinks.splice(index, 1);
    setFormData({ ...formData, links: newLinks });
  };

  const handleSave = () => {
    updateTask(formData);
    handleClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) {
      deleteTask(taskId);
      handleClose();
    }
  };

  const statusMap = {
    'todo': { label: 'Planned', class: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' },
    'in-progress': { label: 'In Progress', class: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30' },
    'done': { label: 'Completed', class: 'bg-accent-green/20 text-accent-green border-accent-green/30' }
  };
  const st = statusMap[formData.status];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-end bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-[fadeIn_0.3s_ease-out]'}`}
      onClick={handleClose}
    >
      <div 
        className={`fixed top-0 right-0 h-full w-[90vw] md:w-[60vw] lg:w-[50vw] bg-[rgba(10,20,15,0.65)] backdrop-blur-3xl border-l border-white/15 z-50 transform flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.6)] transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'} ${!isClosing && 'animate-[slideInRight_0.3s_ease-out]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-black/20">
          <div className="flex items-center gap-3">
             <button type="button" onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
             </button>
             <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border flex items-center gap-1.5 ${st.class}`}>
               <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-current"></span>
               <span>{st.label}</span>
             </span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleDelete} className="text-xs font-bold text-gray-500 hover:text-accent-red transition-colors flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-3 pb-5 px-5 lg:pt-4 lg:pb-6 lg:px-6 space-y-4">
           <textarea 
             name="title"
             value={formData.title}
             onChange={handleChange}
             rows="1" 
             className="w-full bg-transparent text-2xl lg:text-3xl font-bold text-white placeholder-gray-600 border-none outline-none resize-none leading-tight overflow-hidden" 
             placeholder="Untitled Task" 
             style={{ height: 'auto' }}
           ></textarea>

           <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-sm items-center">
              <div className="text-gray-500 flex items-center gap-2 font-medium"><Calendar className="w-4 h-4" /> Due Date</div>
              <input 
                type="datetime-local" 
                name="dueDateTime"
                value={formData.dueDateTime}
                onChange={handleChange}
                className="bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-white outline-none focus:border-accent-yellow w-full max-w-[250px] [color-scheme:dark]" 
              />

              <div className="text-gray-500 flex items-center gap-2 font-medium"><Tag className="w-4 h-4" /> Source / Order</div>
              <input 
                type="text" 
                name="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="e.g. GT, Social, Youtube..." 
                className="bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-white outline-none focus:border-accent-yellow w-full max-w-[250px]" 
              />

              <div className="text-gray-500 flex items-center gap-2 font-medium"><Flame className="w-4 h-4" /> Urgent</div>
              <label className="relative inline-flex items-center cursor-pointer w-max">
                 <input 
                   type="checkbox" 
                   name="urgent"
                   checked={formData.urgent}
                   onChange={handleChange}
                   className="sr-only peer" 
                 />
                 <div className="w-11 h-6 bg-black/50 border border-white/20 rounded-full peer peer-checked:bg-accent-red transition-all shadow-inner"></div>
                 <div className="absolute left-1 top-1 bg-gray-300 w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-white shadow-sm"></div>
              </label>
           </div>

           <hr className="border-white/10" />

           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Description</h4>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-transparent text-[15px] text-gray-300 placeholder-gray-600 border-none outline-none resize-none leading-relaxed overflow-hidden" 
                placeholder="Add some notes, context or requirements..." 
                style={{ minHeight: '220px', height: 'auto' }}
              ></textarea>
           </div>

           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Checklist</h4>
              <div className="space-y-2 mb-2">
                {(formData.subtasks || []).map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <input 
                      type="checkbox" 
                      className="cl-checkbox shrink-0" 
                      checked={subtask.done} 
                      onChange={(e) => handleSubtaskChange(index, 'done', e.target.checked)} 
                    />
                    <input 
                      type="text" 
                      value={subtask.text} 
                      onChange={(e) => handleSubtaskChange(index, 'text', e.target.value)} 
                      placeholder="To do..." 
                      className={`flex-1 bg-transparent border-none outline-none text-sm transition-colors ${subtask.done ? 'line-through text-gray-500' : 'text-gray-300'}`} 
                    />
                    <button onClick={() => removeSubtask(index)} className="text-gray-600 hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSubtask} className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5 transition-colors">
                <Plus className="w-4 h-4" /> Add sub-task
              </button>
           </div>

           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Attachments & Links</h4>
              <div className="space-y-3 mb-2">
                {(formData.links || []).map((link, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2 group relative">
                    <input 
                      type="text" 
                      placeholder="Title" 
                      value={link.title} 
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)} 
                      className="bg-black/20 border border-white/5 rounded px-2.5 py-1.5 text-sm text-white outline-none focus:border-accent-blue focus:bg-black/40" 
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        value={link.url} 
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)} 
                        className="flex-1 bg-black/20 border border-white/5 rounded px-2.5 py-1.5 text-sm text-white outline-none focus:border-accent-blue focus:bg-black/40" 
                      />
                      <button onClick={() => removeLink(index)} className="text-gray-600 hover:text-accent-red shrink-0 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addLink} className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5 transition-colors">
                <Plus className="w-4 h-4" /> Add link
              </button>
           </div>
           <div className="h-6"></div>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 flex justify-end gap-3 bg-black/40 backdrop-blur-md">
           <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-full text-sm font-medium text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">Cancel</button>
           <button type="button" onClick={handleSave} className="bg-accent-yellow hover:bg-yellow-400 text-black px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-yellow-500/20 transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default TaskDrawer;
