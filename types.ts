
export enum Category {
  FOCUS = 'Fokus',
  CREATIVE = 'Kreativ',
  BODY = 'Körper',
  MENTAL = 'Mental',
  LEISURE = 'Freizeit',
  UNASSIGNED = 'Allgemein'
}

export interface Person {
  id: string;
  name: string;
}

export interface Habit {
  id: string;
  title: string;
  category: Category;
  streak: number;
  level: number;
  createdAt: number;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  scheduledDays: number[]; // Array of weekday indices (0=Monday, etc., based on getCurrentWeekDays order)
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO Date string YYYY-MM-DD
  category: Category;
  peopleIds: string[];
  additionalInfo?: string;
  habitId?: string; // Links task to a habit
  createdAt: number;
}

export interface DailyReflection {
  mood: string;
  gratitude: string;
  improvement: string;
}

export interface JournalEntry {
  id: string;
  date: string; // The date the week ended
  archivedDate: string;
  weekLabel: string; // e.g., "KW 42"
  tasks: Task[]; // Full task objects to render grid view
  reflections: Record<string, DailyReflection>;
  notes?: string;
}

export interface Intention {
  day: string;
  week: string;
  month: string;
  year: string;
}

export interface Goals {
  monthly: string;
  yearly: string;
}

export const CATEGORY_THEMES: Record<Category, { border: string, text: string, badge: string }> = {
  [Category.FOCUS]: { border: 'border-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  [Category.CREATIVE]: { border: 'border-violet-500', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800' },
  [Category.BODY]: { border: 'border-green-500', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  [Category.MENTAL]: { border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  [Category.LEISURE]: { border: 'border-pink-500', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-800' },
  [Category.UNASSIGNED]: { border: 'border-gray-400', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' },
};