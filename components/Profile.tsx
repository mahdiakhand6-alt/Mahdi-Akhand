
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, GraduationCap, Target as TargetIcon, Edit2, Check, Moon, Sun, Clock, User as UserIcon, Bell, BellOff, HelpCircle, X, ChevronRight, Info } from 'lucide-react';
import { StudyLevel } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const UserManualModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <HelpCircle size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">User Manual</h3>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Welcome!</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Welcome to <strong>Smart Routine & Study Planner</strong>. This app is designed to help you organize your daily life and reach your study goals easily.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Core Features</h4>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl space-y-3">
                  <div className="flex gap-3">
                    <div className="mt-1 text-indigo-500"><Info size={16} /></div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase mb-1">Home Dashboard</p>
                      <p className="text-[11px] text-slate-500 leading-normal">The home screen shows your current task and a live countdown timer. If multiple tasks happen at once, click the "More" button to see all of them.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="mt-1 text-indigo-500"><Info size={16} /></div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase mb-1">Study Sessions</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Add your study subjects here. The app will automatically create daily study blocks for you so you never forget to learn.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="mt-1 text-indigo-500"><Info size={16} /></div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase mb-1">Notes & Ideas</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Use the Notes tab to write down important things, project ideas, or lecture summaries.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Notification System</h4>
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-5 rounded-[32px] space-y-3">
                  <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">We remind you at 3 key moments:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 5 Minutes before a task starts.
                    </li>
                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Exactly when a task begins.
                    </li>
                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> When a task ends.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Permissions</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  <strong>Camera:</strong> To update your profile picture.<br/>
                  <strong>Notifications:</strong> Required to send you task reminders. Please click "Allow" when the phone asks.
                </p>
              </section>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onClose}
                className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30"
              >
                Got It!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Profile: React.FC = () => {
  const { user, updateProfile, theme, toggleTheme } = useApp();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  const [showManual, setShowManual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfile({ name: tempName });
      setIsEditingName(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-8"
    >
      <header className="text-center space-y-6 pt-6">
        <div className="relative inline-block">
          {user?.photoUrl ? (
            <motion.img 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              src={user.photoUrl} 
              className="w-40 h-40 rounded-[56px] border-8 border-white dark:border-slate-800 shadow-2xl object-cover"
              alt="Profile"
            />
          ) : (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-40 h-40 rounded-[56px] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border-8 border-white dark:border-slate-800 shadow-2xl"
            >
              <UserIcon size={64} />
            </motion.div>
          )}
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-indigo-600 text-white p-4 rounded-3xl shadow-xl border-[6px] border-white dark:border-slate-900 active:scale-90 transition-all"
          >
            <Camera size={24} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            {isEditingName ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3">
                <input autoFocus type="text" className="text-2xl font-black text-black dark:text-white bg-white dark:bg-slate-900 border-b-4 border-indigo-500 outline-none px-4 py-1 text-center w-64" value={tempName} onChange={(e) => setTempName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveName()} />
                <button onClick={handleSaveName} className="p-2 bg-indigo-600 text-white rounded-xl"><Check size={20} /></button>
              </motion.div>
            ) : (
              <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 group">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{user?.name}</h2>
                <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={20} /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 transition-colors">
        <button 
          onClick={() => setShowManual(true)}
          className="w-full flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
              <HelpCircle size={24} />
            </div>
            <div className="text-left">
              <p className="text-base font-black text-slate-800 dark:text-white tracking-tight">User Manual</p>
              <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">How to use this app</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Sun size={14}/> Mode</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => theme === 'dark' && toggleTheme()} className={`flex items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all ${theme === 'light' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <Sun size={20} /> <span className="text-xs font-black uppercase">Light</span>
              </button>
              <button onClick={() => theme === 'light' && toggleTheme()} className={`flex items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'bg-indigo-900/40 border-indigo-500 text-indigo-400' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <Moon size={20} /> <span className="text-xs font-black uppercase">Dark</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Clock size={14}/> Time Format</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => updateProfile({ timeFormat: '12h' })} className={`flex items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all ${user?.timeFormat === '12h' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-400' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <Clock size={20} /> <span className="text-xs font-black uppercase">12 Hours</span>
              </button>
              <button onClick={() => updateProfile({ timeFormat: '24h' })} className={`flex items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all ${user?.timeFormat === '24h' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-400' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                <Clock size={20} /> <span className="text-xs font-black uppercase">24 Hours</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Bell size={14}/> Notifications</h3>
          <button 
            onClick={() => {
              if (!user?.notificationsEnabled && "Notification" in window) {
                Notification.requestPermission();
              }
              updateProfile({ notificationsEnabled: !user?.notificationsEnabled });
            }} 
            className={`w-full flex items-center justify-center gap-3 py-6 rounded-[32px] border-2 transition-all ${user?.notificationsEnabled ? 'bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-400' : 'bg-rose-50 border-rose-600 text-rose-700 dark:bg-rose-900/40 dark:border-rose-500 dark:text-rose-400'}`}
          >
            {user?.notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
            <span className="text-sm font-black uppercase tracking-widest">{user?.notificationsEnabled ? "Enabled" : "Disabled"}</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <GraduationCap size={28} className="text-indigo-600 dark:text-indigo-400 mb-4" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Study Level</p>
          <select className="text-sm font-black text-slate-800 dark:text-white bg-transparent outline-none w-full" value={user?.studyLevel} onChange={(e) => updateProfile({ studyLevel: e.target.value as StudyLevel })}>
            <option value={StudyLevel.SCHOOL}>School</option>
            <option value={StudyLevel.COLLEGE}>College</option>
            <option value={StudyLevel.UNIVERSITY}>University</option>
          </select>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <TargetIcon size={28} className="text-indigo-600 dark:text-indigo-400 mb-4" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Goal (Hrs)</p>
          <input type="number" className="text-sm font-black text-slate-800 dark:text-white bg-transparent outline-none w-full" value={user?.dailyStudyTarget} onChange={(e) => updateProfile({ dailyStudyTarget: parseInt(e.target.value) || 0 })} />
        </div>
      </section>

      <footer className="text-center py-16">
        <p className="text-[12px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em] mb-2">Smart Rutine</p>
        <p className="text-[10px] font-bold text-indigo-500/50 uppercase tracking-[0.3em]">Powered by Mahdi Akhand</p>
      </footer>

      <UserManualModal isOpen={showManual} onClose={() => setShowManual(false)} />
    </motion.div>
  );
};

export default Profile;
