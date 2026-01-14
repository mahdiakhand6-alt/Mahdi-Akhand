
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, StudyLevel, RoutineItem, StudyPlan, DailyTask, Note, TaskStatus } from '../types';

interface AppState {
  user: UserProfile | null;
  routines: RoutineItem[];
  studyPlans: StudyPlan[];
  dailyTasks: DailyTask[];
  notes: Note[];
  notifiedIds: string[]; // Track which notifications have been sent
  loading: boolean;
  theme: 'light' | 'dark';
  currentDate: string; 
  tasksView: 'active' | 'missed' | 'archive';
  setTasksView: (view: 'active' | 'missed' | 'archive') => void;
  toggleTheme: () => void;
  login: () => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addRoutine: (item: RoutineItem) => void;
  deleteRoutine: (id: string) => void;
  addStudyPlan: (plan: StudyPlan) => void;
  updateStudyPlan: (id: string, plan: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;
  addTask: (task: DailyTask) => void;
  updateTask: (id: string, task: Partial<DailyTask>) => void;
  deleteTask: (id: string) => void;
  deleteMultipleTasks: (ids: string[]) => void;
  toggleTaskStatus: (id: string) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  generateTasksForToday: (targetDate?: string) => void;
  markAsNotified: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return date.toTimeString().slice(0, 5);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getTodayString = () => new Date().toLocaleDateString('en-CA');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());
  const [tasksView, setTasksView] = useState<'active' | 'missed' | 'archive'>('active');

  // Load from Storage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setRoutines(JSON.parse(localStorage.getItem('routines') || '[]'));
      setStudyPlans(JSON.parse(localStorage.getItem('studyPlans') || '[]'));
      setDailyTasks(JSON.parse(localStorage.getItem('dailyTasks') || '[]'));
      setNotes(JSON.parse(localStorage.getItem('notes') || '[]'));
      setNotifiedIds(JSON.parse(localStorage.getItem('notifiedIds') || '[]'));
    }
    if (savedTheme) setTheme(savedTheme);
    setLoading(false);
  }, []);

  // Sync to Storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('routines', JSON.stringify(routines));
      localStorage.setItem('studyPlans', JSON.stringify(studyPlans));
      localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
      localStorage.setItem('notes', JSON.stringify(notes));
      localStorage.setItem('notifiedIds', JSON.stringify(notifiedIds));
    }
  }, [user, routines, studyPlans, dailyTasks, notes, notifiedIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = getTodayString();
      if (nowStr !== currentDate) {
        setCurrentDate(nowStr);
        setNotifiedIds([]); // Reset notifications for new day
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const login = () => {
    setUser({
      id: 'user-' + Date.now(),
      name: 'User',
      email: '',
      photoUrl: '',
      studyLevel: StudyLevel.UNIVERSITY,
      dailyStudyTarget: 4,
      personalGoals: 'Achieve my goals',
      notificationsEnabled: true,
      timeFormat: '12h'
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const markAsNotified = (id: string) => {
    setNotifiedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const generateTasksForToday = useCallback((targetDate?: string) => {
    const today = targetDate || currentDate;
    const dateObj = new Date(today);
    const dayOfWeek = dateObj.getDay();

    setDailyTasks(prev => {
      const existingIds = new Set(prev.filter(t => t.date === today).map(t => t.id));
      const newGenerated: DailyTask[] = [];

      routines.forEach(r => {
        const taskId = `routine-${r.id}-${today}`;
        if (!existingIds.has(taskId)) {
          newGenerated.push({
            id: taskId,
            title: r.title,
            startTime: r.startTime,
            endTime: r.endTime,
            status: TaskStatus.PENDING,
            date: today,
            sourceType: 'Routine',
          });
        }
      });

      studyPlans.forEach(s => {
        const taskId = `study-${s.id}-${today}`;
        if (!existingIds.has(taskId)) {
          const isScheduled = s.frequency === 'daily' || s.daysOfWeek.includes(dayOfWeek);
          if (isScheduled) {
            newGenerated.push({
              id: taskId,
              title: s.subject,
              startTime: s.startTime,
              endTime: addMinutesToTime(s.startTime, s.duration),
              status: TaskStatus.PENDING,
              date: today,
              sourceType: 'StudyPlan',
            });
          }
        }
      });

      return newGenerated.length > 0 ? [...prev, ...newGenerated] : prev;
    });
  }, [routines, studyPlans, currentDate]);

  useEffect(() => {
    if (user) {
      generateTasksForToday(currentDate);
    }
  }, [user, routines, studyPlans, currentDate, generateTasksForToday]);

  const addRoutine = (item: RoutineItem) => setRoutines(prev => [...prev, item]);
  const deleteRoutine = (id: string) => setRoutines(prev => prev.filter(r => r.id !== id));
  
  const addStudyPlan = (plan: StudyPlan) => {
    setStudyPlans(prev => [...prev, plan]);
  };

  const updateStudyPlan = (id: string, updates: Partial<StudyPlan>) => {
    setStudyPlans(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStudyPlan = (id: string) => {
    setStudyPlans(prev => prev.filter(s => s.id !== id));
    setDailyTasks(prev => prev.filter(t => !t.id.includes(`study-${id}`)));
  };

  const addTask = (task: DailyTask) => setDailyTasks(prev => [...prev, task]);
  const updateTask = (id: string, updates: Partial<DailyTask>) => {
    setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTask = (id: string) => setDailyTasks(prev => prev.filter(t => t.id !== id));
  
  const deleteMultipleTasks = (ids: string[]) => {
    setDailyTasks(prev => prev.filter(t => !ids.includes(t.id)));
  };

  const toggleTaskStatus = (id: string) => {
    setDailyTasks(prev => prev.map(t => {
      if (t.id === id && t.status !== TaskStatus.DONE) {
        return { ...t, status: TaskStatus.DONE };
      }
      return t;
    }));
  };
  
  const addNote = (note: Note) => setNotes(prev => [note, ...prev]);
  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <AppContext.Provider value={{
      user, routines, studyPlans, dailyTasks, notes, notifiedIds, loading, theme, currentDate, tasksView, setTasksView, toggleTheme,
      login, logout, updateProfile, addRoutine, deleteRoutine, addStudyPlan, updateStudyPlan, deleteStudyPlan,
      addTask, updateTask, deleteTask, deleteMultipleTasks, toggleTaskStatus, addNote, updateNote, deleteNote, generateTasksForToday, markAsNotified
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
