import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Global State
  const [activeTab, setActiveTab] = useState('tasks');
  const [currentTaskView, setCurrentTaskView] = useState('kanban');
  
  // Data State
  const [tasks, setTasks] = useState([]);
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [aiSettings, setAiSettings] = useState({
    provider: 'gemini',
    geminiKey: '',
    geminiModel: 'gemini-2.5-pro',
    openaiKey: '',
    openaiModel: 'whisper-1'
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    const initData = async () => {
      let dataLoadedFromCloud = false;
      
      if (supabase) {
        try {
          const { data, error } = await supabase.from('app_data').select('*').eq('id', 'global').single();
          if (data) {
            // Normalize tasks
            const normalizedTasks = (data.tasks || []).map(t => ({
              ...t,
              status: (t.status && t.status !== 'on-hold') ? t.status : (t.completed ? 'done' : 'todo'),
              order: (t.order !== undefined && t.order !== null) ? t.order : '',
              subtasks: t.subtasks || [],
              links: t.links || [],
              scratchpad: t.scratchpad || '',
              urgent: t.urgent || false,
            }));
            setTasks(normalizedTasks);
            setMeetingHistory(data.meeting_history || []);
            const defaults = { provider: 'gemini', geminiKey: '', geminiModel: 'gemini-2.5-pro', openaiKey: '', openaiModel: 'whisper-1' };
            setAiSettings({ ...defaults, ...(data.ai_settings || {}) });
            dataLoadedFromCloud = true;
          } else {
             // ensure row exists if DB is completely empty (though SQL script does this)
             await supabase.from('app_data').insert([{ id: 'global', tasks: [], meeting_history: [], ai_settings: {} }]).select();
          }
        } catch(e) {
          console.error("Supabase load error:", e);
        }
      }

      if (!dataLoadedFromCloud) {
        // Fallback to local storage if no cloud connection
        const savedTasks = localStorage.getItem('novatask_tasks');
        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks);
            const normalized = parsed.map(t => ({
              ...t,
              status: (t.status && t.status !== 'on-hold') ? t.status : (t.completed ? 'done' : 'todo'),
              order: (t.order !== undefined && t.order !== null) ? t.order : '',
              subtasks: t.subtasks || [],
              links: t.links || [],
              scratchpad: t.scratchpad || '',
              urgent: t.urgent || false,
            }));
            setTasks(normalized);
          } catch(e) {}
        }

        const savedHistory = localStorage.getItem('novatask_ai_history');
        if (savedHistory) {
          try { setMeetingHistory(JSON.parse(savedHistory)); } catch(e) {}
        }
        
        const savedSettings = localStorage.getItem('novatask_ai_settings');
        if (savedSettings) {
          try {
            const defaults = { provider: 'gemini', geminiKey: '', geminiModel: 'gemini-2.5-pro', openaiKey: '', openaiModel: 'whisper-1' };
            setAiSettings({ ...defaults, ...JSON.parse(savedSettings) });
          } catch(e) {}
        }
      }

      setIsLoaded(true);
    };

    initData();
  }, []);

  // Sync to Cloud and LocalStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('novatask_tasks', JSON.stringify(tasks));
    
    if (supabase) {
      supabase.from('app_data').update({ tasks }).eq('id', 'global').then(({error}) => {
        if(error) console.error("Error syncing tasks to Supabase", error);
      });
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('novatask_ai_history', JSON.stringify(meetingHistory));
    
    if (supabase) {
      supabase.from('app_data').update({ meeting_history: meetingHistory }).eq('id', 'global').then(({error}) => {
        if(error) console.error("Error syncing meeting_history to Supabase", error);
      });
    }
  }, [meetingHistory, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('novatask_ai_settings', JSON.stringify(aiSettings));
    
    if (supabase) {
      supabase.from('app_data').update({ ai_settings: aiSettings }).eq('id', 'global').then(({error}) => {
        if(error) console.error("Error syncing ai_settings to Supabase", error);
      });
    }
  }, [aiSettings, isLoaded]);

  // Actions
  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const switchGlobalTab = (tab) => {
    setActiveTab(tab);
  };

  const switchTaskView = (view) => {
    setCurrentTaskView(view);
  };

  // Modal States
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newTaskInitialDate, setNewTaskInitialDate] = useState('');

  const openNewTaskModal = (initialDate = '') => {
    setNewTaskInitialDate(initialDate);
    setIsNewTaskModalOpen(true);
  };

  const closeNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
    setNewTaskInitialDate('');
  };

  return (
    <AppContext.Provider value={{
      activeTab, switchGlobalTab,
      currentTaskView, switchTaskView,
      tasks, setTasks, addTask, updateTask, deleteTask,
      meetingHistory, setMeetingHistory,
      aiSettings, setAiSettings,
      isNewTaskModalOpen, openNewTaskModal, closeNewTaskModal, newTaskInitialDate,
      selectedTaskId, setSelectedTaskId
    }}>
      {children}
    </AppContext.Provider>
  );
};
