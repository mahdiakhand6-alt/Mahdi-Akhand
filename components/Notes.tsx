
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Trash2, Edit3, Save, Eye, ArrowLeft, FileText } from 'lucide-react';
import { Note } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({ title: '', content: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (currentNote.title?.trim()) {
      if (mode === 'add') {
        addNote({
          id: Date.now().toString(),
          title: currentNote.title.trim(),
          content: currentNote.content || '',
          updatedAt: Date.now()
        });
      } else if (mode === 'edit' && currentNote.id) {
        updateNote(currentNote.id, {
          title: currentNote.title.trim(),
          content: currentNote.content
        });
      }
      setMode('list');
      setCurrentNote({ title: '', content: '' });
    }
  };

  const handleAction = (note: Note, newMode: 'view' | 'edit') => {
    setCurrentNote(note);
    setMode(newMode);
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      deleteNote(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 min-h-full">
      <AnimatePresence mode="wait">
        {mode === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">My Notes</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Keep track of ideas</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setCurrentNote({ title: '', content: '' }); setMode('add'); }} className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-xl transition-all"><Plus size={24} /></motion.button>
            </header>

            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search title..." className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] text-xs font-bold outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-100 dark:border-slate-800 opacity-50">
                  <FileText className="mx-auto mb-4" size={56} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No notes yet</p>
                </div>
              ) : (
                filteredNotes.map(note => (
                  <motion.div key={note.id} layout className="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between group shadow-sm transition-all hover:border-indigo-100 dark:hover:border-indigo-900">
                    <div className="flex-1 truncate mr-4">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 truncate tracking-tight">{note.title}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(note.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleAction(note, 'view')} className="p-2.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"><Eye size={18} /></button>
                      <button onClick={() => handleAction(note, 'edit')} className="p-2.5 text-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-xl"><Edit3 size={18} /></button>
                      <button onClick={() => setConfirmDeleteId(note.id)} className="p-2.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl"><Trash2 size={18} /></button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {(mode === 'add' || mode === 'edit') && (
          <motion.div key="editor" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[48px] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <button onClick={() => setMode('list')} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400"><ArrowLeft size={20}/></button>
              <h3 className="font-black text-indigo-600 uppercase text-[10px] tracking-widest">{mode === 'add' ? 'NEW NOTE' : 'EDIT'}</h3>
              <div className="w-12"></div>
            </div>
            <input autoFocus type="text" placeholder="Title" className="w-full text-2xl font-black bg-transparent outline-none text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-4" value={currentNote.title} onChange={e => setCurrentNote({...currentNote, title: e.target.value})} />
            <textarea placeholder="Start writing..." rows={14} className="w-full bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] text-sm font-medium outline-none resize-none text-slate-600 dark:text-slate-400 leading-relaxed" value={currentNote.content} onChange={e => setCurrentNote({...currentNote, content: e.target.value})} />
            <button onClick={handleSave} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all uppercase tracking-widest text-xs"><Save size={20} /> Save Note</button>
          </motion.div>
        )}

        {mode === 'view' && (
          <motion.div key="viewer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="flex items-center gap-4">
              <button onClick={() => setMode('list')} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"><ArrowLeft size={20}/></button>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white truncate flex-1 tracking-tight">{currentNote.title}</h2>
              <button onClick={() => setMode('edit')} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-amber-500 shadow-sm"><Edit3 size={20}/></button>
            </header>
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[60vh] transition-colors relative">
              <div className="text-slate-700 dark:text-slate-300 leading-[1.8] whitespace-pre-wrap text-sm font-medium">
                {currentNote.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Note"
        message="Are you sure? This note will be gone forever."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Notes;
