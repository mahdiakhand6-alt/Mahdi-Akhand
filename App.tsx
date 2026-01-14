
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import StudyPlanner from './components/StudyPlanner';
import Notes from './components/Notes';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import { motion, AnimatePresence } from 'framer-motion';

const MainApp: React.FC = () => {
  const { user, login, loading } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      login();
    }
    const timer = setTimeout(() => setSplashFinished(true), 2500);
    return () => clearTimeout(timer);
  }, [loading, user, login]);

  if (!splashFinished || loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-indigo-600 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-5xl font-black text-white tracking-tighter mb-2"
          >
            Smart Rutine
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-bold text-white uppercase tracking-[0.4em]"
          >
            Powered by Mahdi Akhand
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-12 w-48 h-1 bg-white/20 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (activeTab) {
              case 'home': return <Dashboard setActiveTab={setActiveTab} />;
              case 'tasks': return <Tasks />;
              case 'study': return <StudyPlanner />;
              case 'notes': return <Notes />;
              case 'analytics': return <Analytics />;
              case 'profile': return <Profile />;
              default: return <Dashboard setActiveTab={setActiveTab} />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
