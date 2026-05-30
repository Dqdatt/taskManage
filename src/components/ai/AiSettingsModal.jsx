import React, { useContext, useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

function AiSettingsModal({ onClose }) {
  const { aiSettings, setAiSettings } = useContext(AppContext);
  const [formData, setFormData] = useState({ ...aiSettings });

  useEffect(() => {
    setFormData({ ...aiSettings });
  }, [aiSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setAiSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-[fadeIn_0.3s_ease-out]">
      <div className="glass-container w-full max-w-md rounded-3xl p-8 shadow-2xl relative border border-white/10 animate-[scaleIn_0.3s_ease-out]">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6 text-accent-purple">
          <Settings className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white">AI Configuration</h2>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">
          Choose your AI provider for audio bóc băng and meeting summarization. Keys are saved securely in your browser's local storage.
        </p>
        
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">AI Provider</label>
          <select 
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm mb-4"
          >
            <option value="gemini">Google Gemini (Free, Long Audio)</option>
            <option value="openai">OpenAI (Paid, Whisper)</option>
          </select>
        </div>

        {formData.provider === 'gemini' && (
          <>
            <div className="mb-4 animate-[fadeIn_0.3s_ease-out]">
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Gemini API Key</label>
              <input 
                type="password" 
                name="geminiKey"
                value={formData.geminiKey}
                onChange={handleChange}
                placeholder="AIzaSy..." 
                className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" 
              />
              <p className="text-[10px] text-gray-500 mt-1 ml-1">
                Get a free key from <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-accent-blue underline hover:text-blue-400">Google AI Studio</a>
              </p>
            </div>

            <div className="mb-6 animate-[fadeIn_0.3s_ease-out]">
              <label className="block text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Gemini Model</label>
              <select 
                name="geminiModel"
                value={formData.geminiModel}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1 ml-1">Flash models are extremely fast and ideal for transcribing audio.</p>
            </div>
          </>
        )}

        {formData.provider === 'openai' && (
          <div className="mb-6 animate-[fadeIn_0.3s_ease-out]">
            <label className="block text-[11px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">OpenAI API Key</label>
            <input 
              type="password" 
              name="openaiKey"
              value={formData.openaiKey}
              onChange={handleChange}
              placeholder="sk-..." 
              className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono" 
            />
            <p className="text-[10px] text-gray-500 mt-1 ml-1">
              Get a key from <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-accent-purple underline hover:text-purple-400">OpenAI Platform</a> (requires paid credits)
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="bg-accent-purple hover:bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-purple-500/20 transition-all"
          >
            Save Config
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiSettingsModal;
