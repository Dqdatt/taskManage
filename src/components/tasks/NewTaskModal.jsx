import React, { useContext, useState, useRef, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Loader2, Flag } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function NewTaskModal({ onClose }) {
  const { addTask, newTaskInitialDate, aiSettings } = useContext(AppContext);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDateTime: newTaskInitialDate || '',
    order: '',
    urgent: false,
    taskType: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger transition after mount
    const timer = setTimeout(() => setIsOpen(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    let finalTitle = formData.title;
    if (formData.taskType && !finalTitle.startsWith(`${formData.taskType}: `)) {
      finalTitle = `${formData.taskType}: ${finalTitle}`;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title: finalTitle,
      description: formData.description,
      dueDateTime: formData.dueDateTime,
      order: formData.order,
      urgent: formData.urgent,
      taskType: formData.taskType,
      status: 'todo',
      dateCreated: new Date().toISOString(),
      subtasks: [],
      links: [],
      scratchpad: ''
    };

    addTask(newTask);
    handleClose();
  };

  const fileInputRef = useRef(null);

  const handleAiImageClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          processImageWithAI(file);
          break;
        }
      }
    };
    
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const processImageWithAI = async (file) => {
    if (!file) return;
    
    const provider = aiSettings.provider;
    if (provider !== 'gemini') {
      alert("Image analysis requires Gemini as the AI Provider. Please switch to Gemini in AI Config.");
      return;
    }

    const apiKey = aiSettings.geminiKey;
    if (!apiKey) {
      alert("Please configure your Google Gemini API key in settings first.");
      return;
    }

    setIsAiLoading(true);
    
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });

      const mimeType = file.type || "image/jpeg";
      const promptText = `Bạn là một trợ lý quản lý công việc. Hãy phân tích hình ảnh này và trích xuất thông tin để tạo Task mới.
Hãy trả về ĐÚNG VÀ CHỈ định dạng JSON (không markdown, không chứa backticks ở đầu và cuối) với các trường sau:
{
  "title": "Tên công việc ngắn gọn (tiếng Việt)",
  "description": "Mô tả chi tiết công việc hoặc các ghi chú tìm thấy trong ảnh",
  "dueDateTime": "Ngày giờ hạn chót nếu có trong ảnh, định dạng YYYY-MM-DDTHH:mm (VD: 2026-06-25T15:30). Nếu không có, hãy để rỗng ''",
  "urgent": true hoặc false (true nếu có yếu tố khẩn cấp/quan trọng)
}`;

      const selectedModel = aiSettings.geminiModel || 'gemini-2.5-flash';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              { inlineData: { mimeType: mimeType, data: base64Data } }
            ]
          }]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Lỗi khi gọi API Gemini.");
      }

      const resData = await response.json();
      let textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      textResult = textResult.replace(/```json/gim, '').replace(/```/gim, '').trim();
      
      const taskData = JSON.parse(textResult);
      
      setFormData(prev => ({
        ...prev,
        title: taskData.title || prev.title,
        description: taskData.description || prev.description,
        dueDateTime: taskData.dueDateTime || prev.dueDateTime,
        urgent: taskData.urgent || prev.urgent
      }));

    } catch (error) {
      alert("Error processing image: " + error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageWithAI(file);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${(!isOpen || isClosing) ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      <div 
        className={`glass-container w-full max-w-lg rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-all duration-300 ${(!isOpen || isClosing) ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="button" 
          onClick={handleClose} 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white bg-black/30 hover:bg-black/60 p-1.5 sm:p-2 rounded-full transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 shrink-0">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create New Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* AI Vision Auto-fill */}
          <div 
            onClick={handleAiImageClick}
            className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-accent-purple/50 transition-all flex flex-col items-center justify-center cursor-pointer relative group"
          >
             <ImageIcon className="w-6 h-6 text-gray-400 mb-2 group-hover:text-accent-purple transition-colors" />
             <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-wider">Tạo nhanh bằng hình ảnh</p>
             <p className="text-[10px] sm:text-[11px] text-gray-500 text-center mt-1">Dán ảnh (Ctrl+V) hoặc Click để tải ảnh.<br className="hidden sm:block" />AI sẽ tự động điền các thông tin bên dưới.</p>
             <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                className="hidden" 
                onChange={handleImageInput} 
             />
             
             {isAiLoading && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-accent-purple z-10 border border-accent-purple/50">
                 <Loader2 className="w-6 h-6 animate-spin mb-2" />
                 <span className="text-[11px] font-bold tracking-wider uppercase">Đang phân tích hình ảnh...</span>
               </div>
             )}
          </div>

          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Task Name</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required 
              className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm" 
              placeholder="e.g. Edit final cut" 
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Task Type</label>
            <div className="flex flex-wrap gap-2">
              {['', 'Quay', 'Dựng', 'Livestream'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, taskType: type }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    formData.taskType === type
                      ? type === 'Quay' ? 'type-badge-quay' 
                      : type === 'Dựng' ? 'type-badge-dung'
                      : type === 'Livestream' ? 'type-badge-livestream'
                      : 'bg-white/20 text-white border-white/40'
                      : 'bg-black/30 text-gray-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {type === '' ? 'None' : type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3" 
              className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm resize-none" 
              placeholder="Add detailed instructions..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Due Date</label>
              <input 
                type="datetime-local" 
                name="dueDateTime"
                value={formData.dueDateTime}
                onChange={handleChange}
                className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm text-gray-200 [color-scheme:dark]" 
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Source / Order</label>
              <input 
                type="text" 
                name="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="e.g. GT, Social..." 
                className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm" 
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">High Priority (Urgent)</p>
                <p className="text-xs text-gray-400">Mark as an urgent issue</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="urgent"
                checked={formData.urgent}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-black/50 border border-white/20 rounded-full peer peer-checked:bg-accent-red peer-checked:border-accent-red transition-all"></div>
              <div className="absolute left-1 top-1 bg-gray-300 w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-white shadow-sm"></div>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2.5 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button type="submit" className="bg-accent-yellow hover:bg-yellow-400 text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;
