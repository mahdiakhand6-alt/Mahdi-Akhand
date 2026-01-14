
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Circle, Trophy, ClipboardList, BookOpen, Clock as ClockIcon, AlertTriangle, Trash2, Edit2, Check, User as UserIcon, X, ChevronDown } from 'lucide-react';
import { TaskStatus, DailyTask } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user, dailyTasks, toggleTaskStatus, deleteTask, updateTask, currentDate, setTasksView, notifiedIds, markAsNotified } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState({ title: '', startTime: '', endTime: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showAllActive, setShowAllActive] = useState(false);

  const timeFormat = user?.timeFormat || '12h';

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

  useEffect(() => {
    if (user?.notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [user?.notificationsEnabled]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (user?.notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        const h = now.getHours();
        const m = now.getMinutes();
        const nowTotalMins = h * 60 + m;
        
        dailyTasks.forEach(task => {
          if (task.date === currentDate && task.status === TaskStatus.PENDING) {
            const startMins = timeToMinutes(task.startTime);
            const endMins = timeToMinutes(task.endTime);

            if (nowTotalMins === startMins - 5 && !notifiedIds.includes(`${task.id}-pre`)) {
              new Notification("Upcoming Task", {
                body: `${task.title} starts in 5 minutes.`,
                icon: "/favicon.ico"
              });
              markAsNotified(`${task.id}-pre`);
            }

            if (nowTotalMins === startMins && !notifiedIds.includes(`${task.id}-start`)) {
              new Notification("Task Starting!", {
                body: `${task.title} is starting now.`,
                icon: "/favicon.ico"
              });
              markAsNotified(`${task.id}-start`);
            }

            if (nowTotalMins === endMins && !notifiedIds.includes(`${task.id}-end`)) {
              new Notification("Task Finished", {
                body: `Time is up for: ${task.title}. Check your next task!`,
                icon: "/favicon.ico"
              });
              markAsNotified(`${task.id}-end`);
            }
          }
        });
      }
    }, 1000); 
    return () => clearInterval(timer);
  }, [dailyTasks, user, currentDate, notifiedIds, markAsNotified]);

  const nowTotalSeconds = (currentTime.getHours() * 3600) + (currentTime.getMinutes() * 60) + currentTime.getSeconds();

  const todaysTasks = useMemo(() => 
    dailyTasks.filter(t => t.date === currentDate),
    [dailyTasks, currentDate]
  );

  const pendingAgenda = useMemo(() => 
    todaysTasks.filter(t => t.status === TaskStatus.PENDING)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [todaysTasks]
  );

  const activeTasks = useMemo(() => {
    const nowMins = (currentTime.getHours() * 60) + currentTime.getMinutes();
    return pendingAgenda.filter(t => 
      timeToMinutes(t.startTime) <= nowMins && timeToMinutes(t.endTime) > nowMins
    );
  }, [pendingAgenda, currentTime]);

  const primaryActiveTask = activeTasks[0];

  const missedCount = useMemo(() => {
    const nowMins = (currentTime.getHours() * 60) + currentTime.getMinutes();
    return pendingAgenda.filter(t => timeToMinutes(t.endTime) <= nowMins).length;
  }, [pendingAgenda, currentTime]);

  const upcomingTask = useMemo(() => {
    const nowMins = (currentTime.getHours() * 60) + currentTime.getMinutes();
    return pendingAgenda.find(t => timeToMinutes(t.startTime) > nowMins);
  }, [pendingAgenda, currentTime]);

  const sortedAgenda = useMemo(() => {
    const activeIds = new Set(activeTasks.map(t => t.id));
    const others = pendingAgenda.filter(t => !activeIds.has(t.id));
    return [...activeTasks, ...others];
  }, [activeTasks, pendingAgenda]);

  const formatCountdown = (timeStr: string) => {
    const targetTotalSeconds = timeToMinutes(timeStr) * 60;
    let diff = targetTotalSeconds - nowTotalSeconds;
    
    if (diff <= 0) return "00:00:00";

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const saveEdit = (id: string) => {
    updateTask(id, editBuffer);
    setEditingTaskId(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      deleteTask(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header className="flex justify-between items-center py-6 bg-white dark:bg-slate-900 px-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
            {user?.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: timeFormat === '12h' })}
            </span>
          </div>
        </div>
        <div className="relative">
          {user?.photoUrl ? (
            <img src={user.photoUrl} className="w-14 h-14 rounded-[24px] object-cover shadow-lg border-2 border-white dark:border-slate-800" alt="Profile" />
          ) : (
            <div className="w-14 h-14 rounded-[24px] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
              <UserIcon size={28} />
            </div>
          )}
        </div>
      </header>

      <motion.div 
        className="bg-indigo-600 dark:bg-indigo-900/40 rounded-[56px] p-10 shadow-2xl relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="relative z-10 text-center space-y-4">
          {primaryActiveTask ? (
            <>
              <div className="flex justify-center items-center gap-3 mb-2">
                 <span className="bg-white/20 backdrop-blur-xl text-white text-[12px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-white/20 shadow-xl truncate max-w-[200px]">
                   NOW: {primaryActiveTask.title}
                 </span>
                 {activeTasks.length > 1 && (
                   <button 
                    onClick={() => setShowAllActive(!showAllActive)}
                    className="bg-slate-900/40 hover:bg-slate-900/60 transition-colors text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-1 border border-white/10"
                   >
                     {activeTasks.length - 1} More <ChevronDown size={12} className={showAllActive ? "rotate-180 transition-transform" : "transition-transform"} />
                   </button>
                 )}
              </div>
              
              <AnimatePresence>
                {showAllActive && activeTasks.length > 1 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white/10 backdrop-blur-md rounded-[32px] mb-6 p-6 border border-white/10 text-left"
                  >
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Other Concurrent Tasks</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTasks.slice(1).map(t => (
                        <div key={t.id} className="flex items-center justify-between text-white border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-sm font-bold truncate max-w-[150px]">{t.title}</span>
                          <span className="text-[10px] font-black text-indigo-300">Ends {formatDisplayTime(t.endTime)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                key="timer-active"
                className="text-8xl md:text-9xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl flex items-center justify-center gap-1"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                {formatCountdown(primaryActiveTask.endTime)}
              </motion.div>
              <div className="flex items-center justify-center gap-3 text-indigo-100 text-[12px] font-black uppercase tracking-[0.1em] opacity-70">
                <ClockIcon size={14} /> Ends at {formatDisplayTime(primaryActiveTask.endTime)}
              </div>
            </>
          ) : upcomingTask ? (
            <>
              <div className="flex justify-center">
                <span className="bg-slate-900/40 text-slate-300 text-[12px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em]">Next</span>
              </div>
              <h2 className="text-2xl font-bold text-white/80 line-clamp-1 truncate max-w-[80%] mx-auto">{upcomingTask.title}</h2>
              <div className="text-7xl md:text-8xl font-black text-white/90 tracking-tighter tabular-nums">
                {formatCountdown(upcomingTask.startTime)}
              </div>
              <p className="text-[12px] font-bold text-white/50 uppercase tracking-[0.2em] mt-3">Starts at {formatDisplayTime(upcomingTask.startTime)}</p>
            </>
          ) : (
            <div className="py-12">
              <Trophy className="mx-auto text-amber-300 mb-8 drop-shadow-xl" size={80} />
              <h2 className="text-4xl font-black text-white tracking-tight">All Done!</h2>
              <p className="text-indigo-100/60 text-base font-bold uppercase tracking-widest mt-3">Mission Accomplished.</p>
            </div>
          )}
        </div>
      </motion.div>

      <section className="space-y-6">
        <h3 className="font-black text-slate-800 dark:text-white text-base uppercase tracking-[0.1em] px-4">Agenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAgenda.map(task => {
            const nowMins = (currentTime.getHours() * 60) + currentTime.getMinutes();
            const isLive = activeTasks.some(at => at.id === task.id);
            const isEditing = editingTaskId === task.id;
            const isStudy = task.sourceType === 'StudyPlan';
            const isOverdue = timeToMinutes(task.endTime) <= nowMins;
            
            return (
              <motion.div layout key={task.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border ${isLive ? 'border-indigo-500 ring-4 ring-indigo-500/10' : isOverdue ? 'border-amber-100 dark:border-amber-900/30' : 'border-slate-100 dark:border-slate-800'} flex flex-col gap-4 shadow-sm transition-all group h-full`}>
                <div className="flex items-center gap-5">
                  {!isEditing && (
                    <div onClick={() => toggleTaskStatus(task.id)} className={`cursor-pointer active:scale-90 transition-transform ${isStudy ? 'text-indigo-400' : 'text-amber-400'}`}>
                      <Circle size={32} />
                    </div>
                  )}
                  <div className="flex-1 flex items-center gap-4 overflow-hidden">
                    <div className={`p-3 rounded-2xl shrink-0 ${isStudy ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'}`}>
                      {isStudy ? <BookOpen size={20}/> : <ClipboardList size={20}/>}
                    </div>
                    {isEditing ? (
                      <div className="flex flex-col gap-3 w-full">
                        <input className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={editBuffer.title} onChange={e => setEditBuffer({...editBuffer, title: e.target.value})} placeholder="Title" />
                        <div className="flex gap-3">
                          <input type="time" className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" value={editBuffer.startTime} onChange={e => setEditBuffer({...editBuffer, startTime: e.target.value})} />
                          <input type="time" className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" value={editBuffer.endTime} onChange={e => setEditBuffer({...editBuffer, endTime: e.target.value})} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col truncate">
                        <h4 className="text-base font-black text-slate-800 dark:text-slate-200 truncate tracking-tight">{task.title}</h4>
                        <span className={`text-[12px] font-bold uppercase tracking-widest ${isOverdue ? 'text-amber-500' : 'text-slate-400'}`}>
                          {formatDisplayTime(task.startTime)} - {formatDisplayTime(task.endTime)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(task.id)} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-95"><Check size={20}/></button>
                        <button onClick={() => setEditingTaskId(null)} className="p-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl active:scale-95"><X size={20}/></button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { setEditingTaskId(task.id); setEditBuffer({ title: task.title, startTime: task.startTime, endTime: task.endTime }); }} className="p-3 text-slate-400 hover:text-indigo-600 md:opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={18}/></button>
                        <button onClick={() => setConfirmDeleteId(task.id)} className="p-3 text-slate-400 hover:text-rose-600 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </motion.div>
  );
};

export default Dashboard;
