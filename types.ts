
export enum StudyLevel {
  SCHOOL = 'School',
  COLLEGE = 'College',
  UNIVERSITY = 'University'
}

export enum TaskStatus {
  DONE = 'DONE',
  PENDING = 'PENDING',
  MISSED = 'MISSED'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  studyLevel: StudyLevel;
  dailyStudyTarget: number; // in hours
  personalGoals: string;
  notificationsEnabled: boolean;
  timeFormat: '12h' | '24h'; // New field for user preference
}

export interface RoutineItem {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  type: 'Study' | 'Rest' | 'Work' | 'Personal';
}

export interface StudyPlan {
  id: string;
  subject: string;
  startTime: string; // HH:mm
  duration: number; // minutes
  frequency: 'daily' | 'weekly';
  daysOfWeek: number[]; // 0-6
}

export interface DailyTask {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  sourceType: 'Routine' | 'StudyPlan' | 'Manual';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  description: string;
}
