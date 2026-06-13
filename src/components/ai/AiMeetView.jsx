import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { Sparkles, Settings, Plus, Clock, GitMerge, Mic, Cpu, Zap, Save, Edit2, Trash2 } from 'lucide-react';
import AiSettingsModal from './AiSettingsModal';
import { marked } from 'marked';

function AiMeetView() {
  const { meetingHistory, setMeetingHistory, aiSettings } = useContext(AppContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appState, setAppState] = useState('upload'); // 'upload', 'processing', 'result'
  const [currentSummary, setCurrentSummary] = useState('');
  
  const [selectedMeetingIds, setSelectedMeetingIds] = useState([]);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const fileInputRef = useRef(null);

  const startNewMeeting = () => {
    setAppState('upload');
    setCurrentSummary('');
    setSelectedMeetingIds([]);
  };

  const processAudioFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const provider = aiSettings.provider;

    if (provider === 'gemini') {
      const apiKey = aiSettings.geminiKey;
      if (!apiKey) {
        alert("Please set your Google Gemini API Key first in settings.");
        e.target.value = '';
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        alert("File size exceeds 20MB limit for Gemini Direct Payload. Please compress the file to under 20MB.");
        e.target.value = '';
        return;
      }

      setAppState('processing');
      
      try {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
        });

        const mimeType = file.type || "audio/mp3";
        const selectedModel = aiSettings.geminiModel || 'gemini-3.5-flash';

        const promptText = `Bạn là một trợ lý AI phân tích cuộc họp. Dưới đây là file audio ghi âm cuộc họp.
Nhiệm vụ của bạn là nghe và tóm tắt toàn bộ cuộc họp. KHÔNG CẦN BÓC BĂNG (TRANSCRIPT), chỉ cần trả về duy nhất phần tóm tắt theo cấu trúc sau.
BẮT BUỘC toàn bộ nội dung phải bằng Tiếng Việt và phải format đúng chuẩn Markdown sau:

# RECAP CUỘC HỌP

## I. ĐỊNH HƯỚNG NỘI DUNG TRIỂN KHAI
(Liệt kê chi tiết các hướng nội dung, định hướng visual/concept mới và kế hoạch hành động. Có deadline rõ ràng cho từng phần nếu có, định dạng kiểu 'Deadline: Ngày/Tháng/Năm')

## II. PHÂN BỔ CÔNG VIỆC
(Chi tiết phân chia công việc rõ ràng cho từng thành viên tham gia cuộc họp. Ghi rõ nhiệm vụ chi tiết và vai trò của từng người)

## III. WORKFLOW & QUY ĐỊNH LÀM VIỆC
(Các quy định làm việc, quy trình vận hành, lịch trình làm việc và các điều chỉnh lịch được thống nhất trong cuộc họp)

## IV. THIẾT BỊ & CÔNG CỤ HỖ TRỢ
(Các công cụ, phần mềm, thiết bị hỗ trợ hoặc đề xuất cần chuẩn bị)`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }]
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || "Gemini API request failed.");
        }

        const resData = await response.json();
        const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
          throw new Error("No response content from Gemini.");
        }

        const summaryMarkdown = responseText.trim();

        setCurrentSummary(summaryMarkdown);
        setAppState('result');

      } catch (error) {
        alert("Error during Gemini AI processing: " + error.message);
        setAppState('upload');
      }
      e.target.value = '';

    } else {
      // OpenAI flow
      const apiKey = aiSettings.openaiKey;
      if (!apiKey) {
        alert("Please set your OpenAI API Key first in settings.");
        e.target.value = '';
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB limit for OpenAI Whisper.");
        e.target.value = '';
        return;
      }

      setAppState('processing');
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", "whisper-1");

        const transResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: formData
        });

        if (!transResponse.ok) {
           const err = await transResponse.json();
           throw new Error(err.error?.message || "Transcription failed");
        }

        const transData = await transResponse.json();
        const transcriptText = transData.text;

        const gptPrompt = `You are an expert meeting assistant. Please analyze the following meeting transcript.
Your output MUST be formatted in Markdown.
All summaries and action items MUST be in Vietnamese.
Format the summary strictly according to this standard Vietnamese recap structure:

# RECAP CUỘC HỌP

## I. ĐỊNH HƯỚNG NỘI DUNG TRIỂN KHAI
(Liệt kê chi tiết các hướng nội dung, định hướng visual/concept mới và kế hoạch hành động. Có deadline rõ ràng cho từng phần nếu có, định dạng kiểu 'Deadline: Ngày/Tháng/Năm')

## II. PHÂN BỔ CÔNG VIỆC
(Chi tiết phân chia công việc rõ ràng cho từng thành viên tham gia cuộc họp. Ghi rõ nhiệm vụ chi tiết và vai trò của từng người)

## III. WORKFLOW & QUY ĐỊNH LÀM VIỆC
(Các quy định làm việc, quy trình vận hành, lịch trình làm việc và các điều chỉnh lịch được thống nhất trong cuộc họp)

## IV. THIẾT BỊ & CÔNG CỤ HỖ TRỢ
(Các công cụ, phần mềm, thiết bị hỗ trợ hoặc đề xuất cần chuẩn bị)

Transcript to analyze:
"""
${transcriptText}
"""`;

        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: gptPrompt }],
            temperature: 0.7
          })
        });

        if (!chatResponse.ok) {
           const err = await chatResponse.json();
           throw new Error(err.error?.message || "Summary failed");
        }

        const chatData = await chatResponse.json();
        const summaryMarkdown = chatData.choices[0].message.content;

        setCurrentSummary(summaryMarkdown);
        setAppState('result');

      } catch (error) {
        alert("Error during OpenAI processing: " + error.message);
        setAppState('upload');
      }
      e.target.value = '';
    }
  };

  const handleSynthesizeMeetings = async () => {
    if (selectedMeetingIds.length < 2) return;
    
    const selected = meetingHistory.filter(m => selectedMeetingIds.includes(m.id));
    let combinedText = "Dưới đây là các biên bản cuộc họp cũ:\n\n";
    selected.forEach((m, index) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = marked.parse(m.summaryHtml || '');
      combinedText += `--- CUỘC HỌP ${index + 1} ---\n${tempDiv.textContent || tempDiv.innerText}\n\n`;
    });

    const promptText = `Bạn là một trợ lý họp (Meeting Assistant) thông minh. Hãy đọc các biên bản cuộc họp sau đây và tổng hợp chúng thành MỘT biên bản Master Summary duy nhất.
Bản tổng hợp phải bằng tiếng Việt.
Bạn phải định dạng kết quả dưới dạng Markdown theo cấu trúc chuẩn Việt Nam như sau:

# RECAP CUỘC HỌP (TỔNG HỢP)

## I. ĐỊNH HƯỚNG NỘI DUNG TRIỂN KHAI
(Tổng hợp chi tiết các hướng nội dung, định hướng visual/concept mới từ tất cả các cuộc họp. Định dạng rõ ràng, ghi chú deadline nếu có, định dạng kiểu 'Deadline: Ngày/Tháng/Năm')

## II. PHÂN BỔ CÔNG VIỆC
(Tổng hợp phân chia công việc rõ ràng cho từng nhân sự từ tất cả các cuộc họp. Ghi rõ nhiệm vụ chi tiết và vai trò của từng người)

## III. WORKFLOW & QUY ĐỊNH LÀM VIỆC
(Các quy định, workflow, lịch làm việc chung đã được thống nhất từ các cuộc họp)

## IV. THIẾT BỊ & CÔNG CỤ HỖ TRỢ
(Các thiết bị, công cụ hỗ trợ hoặc đề xuất được nhắc đến trong các cuộc họp)

Nội dung các cuộc họp:
${combinedText}`;

    setAppState('processing');
    try {
      const provider = aiSettings.provider;
      let summaryMarkdown = "";

      if (provider === 'gemini') {
        const apiKey = aiSettings.geminiKey;
        if (!apiKey) throw new Error("Google Gemini API Key is missing.");
        const selectedModel = aiSettings.geminiModel || 'gemini-3.5-flash';
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || "Gemini synthesis failed.");
        }
        const resData = await response.json();
        summaryMarkdown = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        const apiKey = aiSettings.openaiKey;
        if (!apiKey) throw new Error("OpenAI API Key is missing.");
        
        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: promptText }],
            temperature: 0.3
          })
        });
        if (!chatResponse.ok) {
           const err = await chatResponse.json();
           throw new Error(err.error?.message || "OpenAI synthesis failed");
        }
        const chatData = await chatResponse.json();
        summaryMarkdown = chatData.choices[0].message.content;
      }

      if (!summaryMarkdown) throw new Error("AI returned empty response.");
      
      setCurrentSummary(summaryMarkdown);
      setAppState('result');
      setSelectedMeetingIds([]); // clear selection after synthesize
    } catch(err) {
      alert("Error during synthesis: " + err.message);
      setAppState('upload');
    }
  };

  const saveCurrentMeetingSummary = () => {
    if (!currentSummary) return;
    const newMeeting = {
      id: 'meet-' + Date.now(),
      date: new Date().toISOString(),
      summaryHtml: currentSummary,
    };
    setMeetingHistory([...meetingHistory, newMeeting]);
    setAppState('upload');
  };

  const deleteMeeting = (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      setMeetingHistory(meetingHistory.filter(m => m.id !== id));
      setSelectedMeetingIds(prev => prev.filter(mId => mId !== id));
      if (appState === 'result') {
        setAppState('upload');
        setCurrentSummary('');
      }
    }
  };

  const renderHistory = () => {
    if (meetingHistory.length === 0) {
      return <div className="text-sm text-gray-500 italic text-center p-4">No saved meetings yet.</div>;
    }

    return [...meetingHistory].reverse().map(m => {
      const dateObj = new Date(m.date);
      const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const title = m.title || `Meeting - ${dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
      
      return (
        <div 
          key={m.id} 
          className="bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-xl transition-colors group flex gap-3 items-start relative"
        >
          <div className="pt-1">
            <input 
              type="checkbox" 
              checked={selectedMeetingIds.includes(m.id)}
              onChange={(e) => {
                if (e.target.checked) setSelectedMeetingIds(prev => [...prev, m.id]);
                else setSelectedMeetingIds(prev => prev.filter(id => id !== m.id));
              }}
              className="w-4 h-4 rounded border-white/20 bg-black/50 text-accent-purple focus:ring-accent-purple focus:ring-offset-0 cursor-pointer" 
            />
          </div>
          <div 
            className="flex-1 cursor-pointer overflow-hidden pr-6" 
            onClick={() => {
              setCurrentSummary(m.summaryHtml);
              setAppState('result');
            }}
          >
            {editingMeetingId === m.id ? (
              <input
                type="text"
                value={editingTitle}
                autoFocus
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => {
                  if (editingTitle.trim() && editingTitle !== m.title) {
                    setMeetingHistory(meetingHistory.map(item => item.id === m.id ? { ...item, title: editingTitle.trim() } : item));
                  }
                  setEditingMeetingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingTitle.trim() && editingTitle !== m.title) {
                      setMeetingHistory(meetingHistory.map(item => item.id === m.id ? { ...item, title: editingTitle.trim() } : item));
                    }
                    setEditingMeetingId(null);
                  }
                }}
                className="w-full bg-black/30 border border-accent-purple/50 px-1.5 -ml-1.5 rounded outline-none text-sm font-bold text-white mb-1"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="text-sm font-bold text-white mb-1 group-hover:text-accent-purple transition-colors truncate" title={title}>
                {title}
              </div>
            )}
            <div className="text-[11px] text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeStr}
            </div>
          </div>
          
          {editingMeetingId !== m.id && (
            <div className="absolute top-3 right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg backdrop-blur-sm border border-white/5 p-0.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle(title);
                  setEditingMeetingId(m.id);
                }}
                className="text-gray-400 hover:text-white p-1.5 transition-colors"
                title="Edit Title"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <div className="w-px h-3 bg-white/10 mx-0.5"></div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMeeting(m.id);
                }}
                className="text-gray-400 hover:text-accent-red p-1.5 transition-colors"
                title="Delete Meeting"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      <header className="px-6 lg:px-8 py-2 shrink-0 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-purple" /> AI Meeting Assistant
        </h1>
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="glass-input px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 border-white/20 hover:border-accent-purple text-gray-300 hover:text-white"
        >
          <Settings className="w-4 h-4" /> API Config
        </button>
      </header>

      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
        
        {/* MAIN AREA (Upload Top on Mobile, Right on Desktop) */}
        <div className="w-full lg:flex-1 flex flex-col relative lg:h-full shrink-0 lg:shrink order-1 lg:order-2">
          
          {/* STATE 1: UPLOAD */}
          {appState === 'upload' && (
            <div className="lg:absolute inset-0 flex flex-col items-center justify-center transition-all bg-black/20 backdrop-blur-md rounded-3xl border border-white/5 animate-[fadeIn_0.3s_ease-out] z-10 py-6 lg:py-0">
              <div 
                className="relative glass-card w-full max-w-xl p-6 sm:p-8 lg:p-12 rounded-[2rem] lg:rounded-[3rem] border-dashed border-[3px] border-white/20 hover:border-accent-purple/60 hover:bg-accent-purple/5 transition-all duration-300 flex flex-col items-center justify-center text-center group shadow-2xl"
              >
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={processAudioFile} 
                  title="Click to upload audio"
                />
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple mb-4 lg:mb-6 group-hover:scale-110 group-hover:bg-accent-purple group-hover:text-white transition-all shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 lg:mb-3">Upload Meeting Audio</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-4 lg:mb-6 text-[12px] sm:text-[13px] lg:text-sm">
                  Drag and drop your audio file here or click to browse. Supported formats: mp3, m4a, wav. <br/>
                  <span className="text-[10px] lg:text-[11px] text-accent-blue mt-2 inline-block">(Max 25MB for Whisper / 20MB for Gemini. Nén về Mono 16-32kbps nếu họp dài)</span>
                </p>
                <div className="bg-white/10 px-5 sm:px-6 py-2 rounded-full text-[13px] sm:text-sm font-bold text-white group-hover:bg-white/20 transition-colors">Select Audio File</div>
              </div>
            </div>
          )}

          {/* STATE 2: PROCESSING */}
          {appState === 'processing' && (
            <div className="lg:absolute inset-0 py-12 lg:py-0 flex flex-col items-center justify-center text-center transition-all bg-black/20 backdrop-blur-md rounded-3xl border border-white/5 z-20 animate-[fadeIn_0.3s_ease-out]">
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 mb-6 lg:mb-8">
                <div className="absolute inset-0 border-4 border-white/10 border-t-accent-purple rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-white/10 border-b-accent-blue rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <Cpu className="w-5 h-5 lg:w-6 lg:h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2">Processing AI...</h3>
              <p className="text-xs lg:text-sm text-gray-400 max-w-xs lg:max-w-sm">This may take a minute depending on the data size. AI is thinking.</p>
            </div>
          )}

          {/* STATE 3: RESULTS */}
          {appState === 'result' && (
            <div className="lg:absolute inset-0 flex flex-col min-h-[400px] lg:min-h-0 transition-all z-20 glass-card rounded-3xl p-4 md:p-6 border border-accent-purple/30 bg-gradient-to-br from-accent-purple/10 to-transparent shadow-[0_0_30px_rgba(217,70,239,0.1)] animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3 shrink-0">
                <h3 className="text-sm font-bold text-accent-purple uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-5 h-5" /> AI Summary
                </h3>
                <button 
                  onClick={saveCurrentMeetingSummary} 
                  className="bg-accent-purple hover:bg-purple-500 text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-xs lg:text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-4">
                <div 
                  className="text-sm lg:text-[15px] text-white leading-relaxed markdown-content"
                  dangerouslySetInnerHTML={{ __html: marked.parse(currentSummary || '') }}
                />
              </div>
            </div>
          )}
        </div>

        {/* HISTORY SIDEBAR (Moved to bottom on Mobile, Left on Desktop) */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col h-[400px] lg:h-full gap-4 order-2 lg:order-1">
          <button 
            onClick={startNewMeeting} 
            className="glass-input w-full py-3 rounded-2xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white border border-white/10 shadow-lg group shrink-0"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> New Meeting
          </button>
          
          <div className="glass-card rounded-3xl p-5 flex-1 flex flex-col min-h-0 border border-white/10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
              <Clock className="w-4 h-4" /> Saved Meetings
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
              {renderHistory()}
            </div>
            
            {selectedMeetingIds.length >= 2 && (
              <button 
                onClick={handleSynthesizeMeetings}
                className="w-full mt-4 bg-gradient-to-r from-accent-blue to-accent-purple text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] flex items-center justify-center gap-2 shrink-0"
              >
                <GitMerge className="w-4 h-4" /> Combine & Summarize
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <AiSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

export default AiMeetView;
