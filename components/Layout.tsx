
import React from 'react';
import { Home, ClipboardList, BookOpen, FileText, BarChart2, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
    { id: 'study', icon: BookOpen, label: 'Study' },
    { id: 'notes', icon: FileText, label: 'Notes' },
    { id: 'analytics', icon: BarChart2, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      <main className="flex-1 overflow-y-auto pb-32 p-4 md:p-8 scroll-smooth">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <nav className="w-full max-w-4xl pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 safe-area-bottom flex justify-around items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[40px] transition-colors duration-300">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1.5 relative py-1"
              >
                <motion.div 
                  className={`p-3 rounded-2xl transition-all relative z-10 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -4 : 0
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 -z-10"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <Icon size={22} />
                </motion.div>
                <motion.span 
                  className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                >
                  {tab.label}
                </motion.span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
