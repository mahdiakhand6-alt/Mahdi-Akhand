
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, PieChart, Pie, Sector 
} from 'recharts';
// Fix: Added missing Trophy icon to the lucide-react imports
import { TrendingUp, Award, Clock, Calendar, CheckCircle2, BookOpen, Zap, Trophy } from 'lucide-react';
import { TaskStatus, DailyTask } from '../types';
import { motion } from 'framer-motion';

const Analytics: React.FC = () => {
  const { dailyTasks, notes, studyPlans, theme } = useApp();
  const isDark = theme === 'dark';

  // --- Real-time Calculations ---

  // 1. Weekly Progress Data
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const tasksOnDate = dailyTasks.filter(t => t.date === date);
      const completedOnDate = tasksOnDate.filter(t => t.status === TaskStatus.DONE).length;
      const dayIndex = new Date(date).getDay();
      return {
        name: days[dayIndex],
        fullDate: date,
        completed: completedOnDate,
        total: tasksOnDate.length
      };
    });
  }, [dailyTasks]);

  // 2. Consistency & Streak Calculation
  const stats = useMemo(() => {
    const totalTasks = dailyTasks.length;
    const completedTasks = dailyTasks.filter(t => t.status === TaskStatus.DONE).length;
    const consistency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Streak logic
    const completedDates = Array.from(new Set(
      dailyTasks
        .filter(t => t.status === TaskStatus.DONE)
        .map(t => t.date)
    )).sort().reverse();

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (completedDates.includes(today) || completedDates.includes(yesterdayStr)) {
      let checkDate = new Date(completedDates[0] === today ? today : yesterdayStr);
      for (let i = 0; i < completedDates.length; i++) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (completedDates.includes(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return { totalTasks, completedTasks, consistency, currentStreak };
  }, [dailyTasks]);

  // 3. Task Distribution (Study vs Routine)
  const distributionData = useMemo(() => {
    const studyTasks = dailyTasks.filter(t => t.sourceType === 'StudyPlan').length;
    const routineTasks = dailyTasks.filter(t => t.sourceType === 'Routine').length;
    const manualTasks = dailyTasks.filter(t => t.sourceType === 'Manual').length;

    return [
      { name: 'Study', value: studyTasks, fill: '#6366F1' },
      { name: 'Routine', value: routineTasks, fill: '#F59E0B' },
      { name: 'Manual', value: manualTasks, fill: '#10B981' },
    ].filter(d => d.value > 0);
  }, [dailyTasks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-6"
    >
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Productivity Insights</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time analysis of your growth.</p>
      </header>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
            <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stats.completedTasks}</span>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Tasks Solved</p>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="bg-amber-50 dark:bg-amber-900/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
            <Zap className="text-amber-600 dark:text-amber-500" size={20} />
          </div>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stats.currentStreak}d</span>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Current Streak</p>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stats.consistency}%</span>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Consistency</p>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="bg-rose-50 dark:bg-rose-900/20 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
            <BookOpen className="text-rose-600 dark:text-rose-400" size={20} />
          </div>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{notes.length}</span>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Study Notes</p>
        </motion.div>
      </div>

      {/* Main Bar Chart - Weekly Activity */}
      <motion.section variants={cardVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Weekly Progress</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tasks completed daily</p>
          </div>
          <Calendar size={18} className="text-indigo-600" />
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: isDark ? '#475569' : '#94A3B8'}} 
              />
              <Tooltip 
                cursor={{fill: isDark ? '#1E293B' : '#F8FAFC', radius: 12}} 
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
                itemStyle={{color: '#6366F1', fontWeight: 800, fontSize: '12px'}}
              />
              <Bar dataKey="completed" radius={[8, 8, 8, 8]} barSize={24}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completed > 0 ? '#6366F1' : (isDark ? '#1E293B' : '#F1F5F9')} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Task Distribution - Pie Chart */}
      <div className="grid grid-cols-1 gap-6">
        <motion.section variants={cardVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center">
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">Focus Balance</h3>
            <p className="text-xs text-slate-400 mb-4">Where you spend your time</p>
            <div className="space-y-2">
              {distributionData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.name}: {item.value} tasks</span>
                </div>
              ))}
              {distributionData.length === 0 && <p className="text-[10px] text-slate-400 font-bold uppercase italic">No data yet</p>}
            </div>
          </div>
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData.length > 0 ? distributionData : [{name: 'Empty', value: 1, fill: isDark ? '#1E293B' : '#F1F5F9'}]}
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Motivational Trend Area Chart */}
        <motion.section 
          variants={cardVariants}
          className="bg-indigo-600 dark:bg-indigo-900/40 p-6 rounded-[32px] text-white overflow-hidden relative border border-white/5"
        >
          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <Area type="monotone" dataKey="completed" stroke="#FFFFFF" fill="#FFFFFF" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Trophy size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Performance AI</h3>
            </div>
            <p className="text-xl font-bold mb-1">
              {stats.consistency > 70 ? 'Unstoppable Momentum!' : 'Keep Pushing Forward!'}
            </p>
            <p className="text-xs text-indigo-100 opacity-80 max-w-[200px]">
              {stats.completedTasks > 0 
                ? `You've completed ${stats.completedTasks} tasks this week. Your consistency is ${stats.consistency}%.` 
                : "Start finishing tasks to see your AI-powered performance report here."}
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Analytics;
