
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, Check, Package, CheckSquare, Square, ClipboardList, X } from 'lucide-react';
import { TaskStatus, DailyTask } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const Tasks: React.FC = () => {
  const { user, dailyTasks, toggleTaskStatus, deleteTask, deleteMultipleTasks, addTask, updateTask, currentDate, tasksView: view, setTasksView: setView } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', startTime: '09:00', endTime: '10:00' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState({ title: '', startTime: '', endTime: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState(false);

  const timeFormat = user?.timeFormat || '12h';
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

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

  const listItems = useMemo(() => {
    // Exclude StudyPlan tasks from this page as they have their own dedicated page
    const generalTasks = dailyTasks.filter(t => t.sourceType !== 'StudyPlan');
    
    switch (view) {
      case 'active':
        return generalTasks.filter(t => t.date === currentDate && t.status === TaskStatus.PENDING && timeToMinutes(t.endTime) > nowMinutes)
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      case 'missed':
        return generalTasks.filter(t => t.date === currentDate && t.status === TaskStatus.PENDING && timeToMinutes(t.endTime) <= nowMinutes)
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      case 'archive':
        return generalTasks.filter(t => t.status === TaskStatus.DONE || t.date !== currentDate)
          .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
      default:
        return [];
    }
  }, [dailyTasks, view, currentDate, nowMinutes]);

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        id: `manual-${Date.now()}`,
        title: newTask.title,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        status: TaskStatus.PENDING,
        date: currentDate,
        sourceType: 'Manual'
      });
      setNewTask({ title: '', startTime: '09:00', endTime: '10:00' });
      setIsAdding(false);
    }
  };

  const saveEditing = (id: string) => {
    updateTask(id, editBuffer);
    setEditingId(null);
  };

  const handleDeleteSingle = () => {
    if (confirmDeleteId) {
      deleteTask(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteBatch = () => {
    deleteMultipleTasks(selectedIds);
    setSelectedIds([]);
    setSelectMode(false);
    setConfirmDeleteBatch(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Tasks</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage your day</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setSelectMode(!selectMode); setSelectedIds([]); }}
              className={`p-4 rounded-2xl shadow-xl transition-all ${selectMode ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400'}`}
            >
              <CheckSquare size={24} />
            </button>
            <button onClick={() => setIsAdding(!isAdding)} className={`p-4 rounded-2xl shadow-xl transition-all ${isAdding ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-600 text-white'}`}>
              <Plus size={24} className={isAdding ? "rotate-45" : ""} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <button onClick={() => setView('active')} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'active' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Current</button>
          <button onClick={() => setView('missed')} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'missed' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>Missed</button>
          <button onClick={() => setView('archive')} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'archive' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}>Done</button>
        </div>
      </header>

      <AnimatePresence>
        {selectMode && selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[100] bg-rose-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between max-w-md mx-auto"
          >
            <p className="font-bold text-sm">{selectedIds.length} Selected</p>
            <button onClick={() => setConfirmDeleteBatch(true)} className="bg-white/20 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">Delete All</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 shadow-2xl space-y-4 my-2">
              <input autoFocus type="text" placeholder="Task name..." className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-600/20" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <div className="flex gap-4">
                <input type="time" className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} />
                <input type="time" className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} />
              </div>
              <button onClick={handleAddTask} className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black shadow-lg uppercase tracking-widest text-xs">Add Task</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {listItems.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-100 dark:border-slate-800 opacity-50">
              <Package className="mx-auto mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest">Nothing to show</p>
            </div>
          ) : (
            listItems.map(task => {
              const isEditing = editingId === task.id;
              const isSelected = selectedIds.includes(task.id);
              return (
                <div key={task.id} className={`bg-white dark:bg-slate-900 p-5 rounded-[32px] border ${task.status === TaskStatus.DONE ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-slate-100 dark:border-slate-800'} ${isSelected ? 'ring-2 ring-indigo-600' : ''} flex items-center justify-between shadow-sm group`}>
                  <div className="flex items-center gap-4 flex-1">
                    {selectMode ? (
                      <div onClick={() => toggleSelect(task.id)} className={`cursor-pointer ${isSelected ? 'text-indigo-600' : 'text-slate-200'}`}>
                        {isSelected ? <CheckSquare size={28} /> : <Square size={28} />}
                      </div>
                    ) : (
                      !isEditing && <div onClick={() => toggleTaskStatus(task.id)} className={`cursor-pointer transition-colors ${task.status === TaskStatus.DONE ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-800'}`}>{task.status === TaskStatus.DONE ? <CheckCircle2 size={28}/> : <Circle size={28} />}</div>
                    )}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="p-1.5 rounded-lg shrink-0 bg-amber-50 dark:bg-amber-900/30 text-amber-600">
                        <ClipboardList size={14}/>
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 w-full">
                            <input className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" value={editBuffer.title} onChange={e => setEditBuffer({...editBuffer, title: e.target.value})} placeholder="Title" />
                            <div className="flex gap-2">
                              <input type="time" className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" value={editBuffer.startTime} onChange={e => setEditBuffer({...editBuffer, startTime: e.target.value})} />
                              <input type="time" className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" value={editBuffer.endTime} onChange={e => setEditBuffer({...editBuffer, endTime: e.target.value})} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className={`text-sm font-black ${task.status === TaskStatus.DONE ? 'line-through opacity-40 text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {formatDisplayTime(task.startTime)} - {formatDisplayTime(task.endTime)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!selectMode && (
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button onClick={() => saveEditing(task.id)} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg"><Check size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl"><X size={18}/></button>
                        </div>
                      ) : (
                        <div className="flex opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button onClick={() => { setEditingId(task.id); setEditBuffer({ title: task.title, startTime: task.startTime, endTime: task.endTime }); }} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                          <button onClick={() => setConfirmDeleteId(task.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Task"
        message="Delete this task forever?"
        onConfirm={handleDeleteSingle}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmModal
        isOpen={confirmDeleteBatch}
        title="Delete Multiple"
        message={`Delete ${selectedIds.length} tasks at once?`}
        onConfirm={handleDeleteBatch}
        onCancel={() => setConfirmDeleteBatch(false)}
      />
    </div>
  );
};

export default Tasks;
