import { useContext, useState } from 'react';
import { Clock, GitMerge, Loader2, Mic, Plus, Save, Settings, Sparkles, Trash2 } from 'lucide-react';
import { marked } from 'marked';
import { AppContext } from '../../context/AppContext';
import AiSettingsModal from '../ai/AiSettingsModal';

function MobileAiPage() {
  const { meetingHistory, setMeetingHistory, aiSettings } = useContext(AppContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appState, setAppState] = useState('upload');
  const [currentSummary, setCurrentSummary] = useState('');
  const [selectedMeetingIds, setSelectedMeetingIds] = useState([]);

  const processAudioFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const provider = aiSettings.provider;

    if (provider === 'gemini') {
      if (!aiSettings.geminiKey) {
        alert('Please set your Google Gemini API Key first in settings.');
        event.target.value = '';
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit for Gemini Direct Payload.');
        event.target.value = '';
        return;
      }
      setAppState('processing');
      try {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
        });

        const promptText = `Bạn là một trợ lý AI phân tích cuộc họp. Hãy nghe file audio và trả về duy nhất phần tóm tắt bằng Tiếng Việt, format Markdown:

# RECAP CUỘC HỌP

## I. ĐỊNH HƯỚNG NỘI DUNG TRIỂN KHAI
## II. PHÂN BỔ CÔNG VIỆC
## III. WORKFLOW & QUY ĐỊNH LÀM VIỆC
## IV. THIẾT BỊ & CÔNG CỤ HỖ TRỢ`;

        const selectedModel = aiSettings.geminiModel || 'gemini-2.5-flash';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${aiSettings.geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: promptText },
                { inlineData: { mimeType: file.type || 'audio/mp3', data: base64Data } },
              ],
            }],
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'Gemini API request failed.');
        }
        const data = await response.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!summary) throw new Error('No response content from Gemini.');
        setCurrentSummary(summary.trim());
        setAppState('result');
      } catch (error) {
        alert(`Error during Gemini AI processing: ${error.message}`);
        setAppState('upload');
      }
      event.target.value = '';
      return;
    }

    if (!aiSettings.openaiKey) {
      alert('Please set your OpenAI API Key first in settings.');
      event.target.value = '';
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit for OpenAI Whisper.');
      event.target.value = '';
      return;
    }

    setAppState('processing');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');

      const transResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${aiSettings.openaiKey}` },
        body: formData,
      });
      if (!transResponse.ok) {
        const err = await transResponse.json();
        throw new Error(err.error?.message || 'Transcription failed.');
      }
      const transData = await transResponse.json();

      const promptText = `Analyze this meeting transcript. Output Vietnamese Markdown with sections:
# RECAP CUỘC HỌP
## I. ĐỊNH HƯỚNG NỘI DUNG TRIỂN KHAI
## II. PHÂN BỔ CÔNG VIỆC
## III. WORKFLOW & QUY ĐỊNH LÀM VIỆC
## IV. THIẾT BỊ & CÔNG CỤ HỖ TRỢ

Transcript:
"""${transData.text}"""`;

      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${aiSettings.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.7,
        }),
      });
      if (!chatResponse.ok) {
        const err = await chatResponse.json();
        throw new Error(err.error?.message || 'Summary failed.');
      }
      const chatData = await chatResponse.json();
      setCurrentSummary(chatData.choices[0].message.content);
      setAppState('result');
    } catch (error) {
      alert(`Error during OpenAI processing: ${error.message}`);
      setAppState('upload');
    }
    event.target.value = '';
  };

  const saveSummary = () => {
    if (!currentSummary) return;
    setMeetingHistory([
      ...meetingHistory,
      { id: `meet-${Date.now()}`, date: new Date().toISOString(), summaryHtml: currentSummary },
    ]);
    setCurrentSummary('');
    setAppState('upload');
  };

  const synthesizeMeetings = async () => {
    if (selectedMeetingIds.length < 2) return;
    const selected = meetingHistory.filter((meeting) => selectedMeetingIds.includes(meeting.id));
    const combinedText = selected.map((meeting, index) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = marked.parse(meeting.summaryHtml || '');
      return `--- CUỘC HỌP ${index + 1} ---\n${tempDiv.textContent || tempDiv.innerText}`;
    }).join('\n\n');

    setAppState('processing');
    try {
      const promptText = `Bạn là trợ lý họp. Tổng hợp các biên bản sau thành một bản Markdown tiếng Việt theo cấu trúc RECAP CUỘC HỌP:\n\n${combinedText}`;
      let summary = '';
      if (aiSettings.provider === 'gemini') {
        if (!aiSettings.geminiKey) throw new Error('Google Gemini API Key is missing.');
        const selectedModel = aiSettings.geminiModel || 'gemini-2.5-flash';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${aiSettings.geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'Gemini synthesis failed.');
        }
        const data = await response.json();
        summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        if (!aiSettings.openaiKey) throw new Error('OpenAI API Key is missing.');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${aiSettings.openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.3,
          }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'OpenAI synthesis failed.');
        }
        const data = await response.json();
        summary = data.choices[0].message.content;
      }
      setCurrentSummary(summary);
      setSelectedMeetingIds([]);
      setAppState('result');
    } catch (error) {
      alert(`Error during synthesis: ${error.message}`);
      setAppState('upload');
    }
  };

  const deleteMeeting = (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    setMeetingHistory(meetingHistory.filter((meeting) => meeting.id !== id));
    setSelectedMeetingIds((prev) => prev.filter((meetingId) => meetingId !== id));
  };

  return (
    <div className="mobile-page">
      <div className="mobile-page-actions">
        <button type="button" onClick={() => { setAppState('upload'); setCurrentSummary(''); }} className="mobile-mini-button">
          <Plus className="w-4 h-4" /> New
        </button>
        <button type="button" onClick={() => setIsSettingsOpen(true)} className="mobile-mini-button">
          <Settings className="w-4 h-4" /> API Config
        </button>
      </div>

      {appState === 'upload' && (
        <section className="mobile-ai-upload">
          <input type="file" accept="audio/*" onChange={processAudioFile} aria-label="Upload meeting audio" />
          <div className="mobile-ai-orb">
            <Mic className="w-9 h-9" />
          </div>
          <h2 className="mt-4 text-[22px] font-black text-white">Upload meeting audio</h2>
          <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-relaxed text-white/50">
            MP3, M4A or WAV. Gemini up to 20MB, OpenAI up to 25MB.
          </p>
        </section>
      )}

      {appState === 'processing' && (
        <section className="mobile-panel text-center py-12">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-fuchsia-200" />
          <h2 className="mt-5 text-xl font-black text-white">Processing AI</h2>
          <p className="mt-2 text-sm text-white/50">Keep the app open while the summary is generated.</p>
        </section>
      )}

      {appState === 'result' && (
        <section className="mobile-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-fuchsia-100/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Summary
            </h2>
            <button type="button" onClick={saveSummary} className="mobile-mini-button">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
          <div className="markdown-content max-h-[46dvh] overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: marked.parse(currentSummary || '') }} />
        </section>
      )}

      <section className="mobile-panel mobile-section-gap">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/60 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Saved meetings
          </h3>
          {selectedMeetingIds.length >= 2 && (
            <button type="button" onClick={synthesizeMeetings} className="mobile-mini-button">
              <GitMerge className="w-4 h-4" /> Combine
            </button>
          )}
        </div>

        <div className="space-y-2">
          {meetingHistory.length === 0 ? (
            <p className="text-sm text-white/45">No saved meetings yet.</p>
          ) : (
            [...meetingHistory].reverse().map((meeting) => {
              const date = new Date(meeting.date);
              const title = meeting.title || `Meeting - ${date.toLocaleDateString('vi-VN')}`;
              return (
                <div key={meeting.id} className="mobile-meeting-item">
                  <input
                    type="checkbox"
                    checked={selectedMeetingIds.includes(meeting.id)}
                    onChange={(event) => {
                      setSelectedMeetingIds((prev) => event.target.checked
                        ? [...prev, meeting.id]
                        : prev.filter((id) => id !== meeting.id));
                    }}
                    className="mobile-checkbox"
                  />
                  <button type="button" onClick={() => { setCurrentSummary(meeting.summaryHtml); setAppState('result'); }} className="min-w-0 flex-1 text-left">
                    <strong className="block truncate text-sm text-white">{title}</strong>
                    <small className="text-xs text-white/40">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small>
                  </button>
                  <button type="button" onClick={() => deleteMeeting(meeting.id)} className="mobile-icon-button text-red-200" aria-label="Delete meeting">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {isSettingsOpen && <AiSettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default MobileAiPage;
