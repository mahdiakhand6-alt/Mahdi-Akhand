
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, CheckCircle2, Circle, Package, CheckSquare, Square, BookOpen } from 'lucide-react';
import { StudyPlan, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const StudyPlanner: React.FC = () => {
  const { user, studyPlans, addStudyPlan, dailyTasks, deleteMultipleTasks, toggleTaskStatus, currentDate } = useApp();
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [view, setView] = useState<'active' | 'missed' | 'archive'>('active');
  const [newPlan, setNewPlan] = useState<Partial<StudyPlan>>({ subject: '', startTime: '16:00', duration: 60 });
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskSelectMode, setTaskSelectMode] = useState(false);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const timeFormat = user?.timeFormat || '12h';
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeFormat === '24h') return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  const studyTasks = useMemo(() => dailyTasks.filter(t => t.sourceType === 'StudyPlan'), [dailyTasks]);

  const listItems = useMemo(() => {
    switch (view) {
      case 'active':
        return studyTasks.filter(t => t.date === currentDate && t.status === TaskStatus.PENDING && timeToMinutes(t.endTime) > nowMinutes)
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      case 'missed':
        return studyTasks.filter(t => t.date === currentDate && t.status === TaskStatus.PENDING && timeToMinutes(t.endTime) <= nowMinutes)
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      case 'archive':
        return studyTasks.filter(t => t.status === TaskStatus.DONE || t.date !== currentDate)
          .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
      default:
        return [];
    }
  }, [studyTasks, view, currentDate, nowMinutes]);

  const handleAddPlan = () => {
    if (newPlan.subject) {
      addStudyPlan({
        id: Date.now().toString(),
        subject: newPlan.subject,
        startTime: newPlan.startTime || '16:00',
        duration: newPlan.duration || 60,
        frequency: 'daily',
        daysOfWeek: [],
      });
      setShowAddPlan(false);
      setNewPlan({ subject: '', startTime: '16:00', duration: 60 });
    }
  };

  const onConfirmDelete = () => {
    if (confirmDeleteId === 'batch') {
      deleteMultipleTasks(selectedTaskIds);
      setSelectedTaskIds([]);
      setTaskSelectMode(false);
    } else if (confirmDeleteId) {
      deleteMultipleTasks([confirmDeleteId]);
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-8 pb-4">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Study Time</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Focus sessions</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setTaskSelectMode(!taskSelectMode); setSelectedTaskIds([]); }}
              className={`p-4 rounded-2xl shadow-xl transition-all ${taskSelectMode ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400'}`}
            >
              <CheckSquare size={24} />
            </button>
            <button onClick={() => setShowAddPlan(!showAddPlan)} className={`p-4 rounded-2xl shadow-xl transition-all ${showAddPlan ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-600 text-white'}`}>
              <Plus size={24} className={showAddPlan ? "rotate-45" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <button onClick={() => setView('active')} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Next</button>
          <button onClick={() => setView('missed')} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'missed' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Missed</button>
          <button onClick={() => setView('archive')} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'archive' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Done</button>
        </div>
      </header>

      <AnimatePresence>
        {taskSelectMode && selectedTaskIds.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[100] bg-rose-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between max-w-md mx-auto"
          >
            <p className="font-bold text-sm">{selectedTaskIds.length} Selected</p>
            <button onClick={() => setConfirmDeleteId('batch')} className="bg-white/20 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">Delete All</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showAddPlan && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-indigo-100 dark:border-indigo-900/30 shadow-2xl space-y-6">
              <input type="text" placeholder="Subject..." className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none" value={newPlan.subject} onChange={e => setNewPlan({...newPlan, subject: e.target.value})} />
              <div className="flex gap-4">
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1">Time</p>
                   <input type="time" className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none" value={newPlan.startTime} onChange={e => setNewPlan({...newPlan, startTime: e.target.value})} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1">Mins</p>
                   <input type="number" placeholder="Duration" className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none" value={newPlan.duration} onChange={e => setNewPlan({...newPlan, duration: parseInt(e.target.value)})} />
                </div>
              </div>
              <button onClick={handleAddPlan} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg uppercase tracking-widest text-xs">Save Plan</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {listItems.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-100 dark:border-slate-800 opacity-50">
              <Package className="mx-auto mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest">Nothing here</p>
            </div>
          ) : (
            listItems.map(task => {
              const isSelected = selectedTaskIds.includes(task.id);
              return (
                <div key={task.id} className={`bg-white dark:bg-slate-900 p-5 rounded-[32px] border ${task.status === TaskStatus.DONE ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-slate-100 dark:border-slate-800'} ${isSelected ? 'ring-2 ring-indigo-600' : ''} flex items-center justify-between shadow-sm group`}>
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    {taskSelectMode ? (
                      <div onClick={() => setSelectedTaskIds(prev => prev.includes(task.id) ? prev.filter(i => i !== task.id) : [...prev, task.id])} className={`cursor-pointer ${isSelected ? 'text-indigo-600' : 'text-slate-200'}`}>
                        {isSelected ? <CheckSquare size={28} /> : <Square size={28} />}
                      </div>
                    ) : (
                      <div onClick={() => toggleTaskStatus(task.id)} className={`cursor-pointer active:scale-90 ${task.status === TaskStatus.DONE ? 'text-emerald-500' : 'text-indigo-300 dark:text-indigo-800'}`}>
                        {task.status === TaskStatus.DONE ? <CheckCircle2 size={28}/> : <Circle size={28} />}
                      </div>
                    )}
                    <div className="flex-1 flex items-center gap-3 overflow-hidden">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                        <BookOpen size={14}/>
                      </div>
                      <div className="truncate">
                        <h4 className={`text-sm font-black truncate ${task.status === TaskStatus.DONE ? 'line-through opacity-40 text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60">{formatDisplayTime(task.startTime)} - {formatDisplayTime(task.endTime)}</p>
                      </div>
                    </div>
                  </div>
                  {!taskSelectMode && (
                    <button onClick={() => setConfirmDeleteId(task.id)} className="p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Item"
        message="Delete selected study item(s)? This cannot be undone."
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default StudyPlanner;
