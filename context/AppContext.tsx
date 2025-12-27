import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Task, JournalEntry, Person, Intention, Goals, Category, DailyReflection, Habit, Workout } from '../types';

interface AppState {
  tasks: Task[];
  journal: JournalEntry[];
  people: Person[];
  habits: Habit[];
  workouts: Workout[];
  intention: Intention;
  goals: Goals;
  dailyReflections: Record<string, DailyReflection>; // key is ISO date string
}

interface AppContextType extends AppState {
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addPerson: (name: string) => void;
  addHabit: (title: string, category: Category) => void;
  deleteHabit: (id: string) => void;
  toggleHabitForDate: (habit: Habit, date: string) => void;
  addWorkout: (name: string, description: string, scheduledDays: number[]) => void;
  deleteWorkout: (id: string) => void;
  scheduleWorkout: (workout: Workout, date: string) => void;
  endWeek: () => void;
  updateIntention: (key: keyof Intention, value: string) => void;
  updateGoals: (key: keyof Goals, value: string) => void;
  updateJournalEntry: (id: string, notes: string) => void;
  updateJournalReflection: (journalId: string, date: string, field: keyof DailyReflection, value: string) => void;
  updateDailyReflection: (date: string, field: keyof DailyReflection, value: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'mindful_weekly_data';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const getInitialState = (): AppState => {
  const defaultState: AppState = {
    tasks: [],
    journal: [],
    people: [],
    habits: [],
    workouts: [],
    intention: { day: '', week: '', month: '', year: '' },
    goals: { monthly: '', yearly: '' },
    dailyReflections: {},
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Robust merge: Use parsed value if it exists, otherwise fallback to default
      // This ensures that if new fields are added to the app, they don't crash the state
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultState.tasks,
        journal: Array.isArray(parsed.journal) ? parsed.journal : defaultState.journal,
        people: Array.isArray(parsed.people) ? parsed.people : defaultState.people,
        habits: Array.isArray(parsed.habits) ? parsed.habits : defaultState.habits,
        intention: parsed.intention || defaultState.intention,
        goals: parsed.goals || defaultState.goals,
        dailyReflections: parsed.dailyReflections || defaultState.dailyReflections,
        workouts: Array.isArray(parsed.workouts) 
            ? parsed.workouts.map((w: any) => ({ ...w, scheduledDays: w.scheduledDays || [] }))
            : defaultState.workouts
      };
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return defaultState;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
  }, [state]);

  const addTask = (task: Task) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const updateTask = (updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => {
        return {
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id)
        };
    });
  };

  const addPerson = (name: string) => {
    const newPerson: Person = { id: generateId(), name };
    setState(prev => ({ ...prev, people: [...prev.people, newPerson] }));
  };

  // --- Habits Logic ---
  const addHabit = (title: string, category: Category) => {
    const newHabit: Habit = { id: generateId(), title, category, streak: 0, level: 1, createdAt: Date.now() };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const deleteHabit = (id: string) => {
    setState(prev => ({ 
        ...prev, 
        habits: prev.habits.filter(h => h.id !== id),
        tasks: prev.tasks.filter(t => t.habitId !== id)
    }));
  };

  const toggleHabitForDate = (habit: Habit, date: string) => {
    setState(prev => {
        const existingTask = prev.tasks.find(t => t.habitId === habit.id && t.date === date);
        
        if (existingTask) {
            // Untoggle
            return {
                ...prev,
                tasks: prev.tasks.filter(t => t.id !== existingTask.id)
            };
        } else {
            // Toggle On
            const newTask: Task = {
                id: generateId(),
                text: habit.title,
                completed: true,
                date: date,
                category: habit.category || Category.UNASSIGNED,
                peopleIds: [],
                habitId: habit.id,
                createdAt: Date.now()
            };
            
            const updatedHabits = prev.habits.map(h => {
                if (h.id === habit.id) {
                    const newStreak = h.streak + 1;
                    const newLevel = Math.floor(newStreak / 7) + 1;
                    return { ...h, streak: newStreak, level: newLevel };
                }
                return h;
            });

            return {
                ...prev,
                habits: updatedHabits,
                tasks: [...prev.tasks, newTask]
            };
        }
    });
  };

  // --- Workout Logic ---
  const addWorkout = (name: string, description: string, scheduledDays: number[]) => {
      const newWorkout: Workout = { id: generateId(), name, description, scheduledDays };
      setState(prev => ({ ...prev, workouts: [...prev.workouts, newWorkout]}));
  };

  const deleteWorkout = (id: string) => {
      setState(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id)}));
  };

  const scheduleWorkout = (workout: Workout, date: string) => {
      const newTask: Task = {
          id: generateId(),
          text: `Training: ${workout.name}`,
          additionalInfo: workout.description,
          completed: false,
          date: date,
          category: Category.BODY,
          peopleIds: [],
          createdAt: Date.now()
      };
      addTask(newTask);
  };

  const updateIntention = (key: keyof Intention, value: string) => {
    setState(prev => ({ ...prev, intention: { ...prev.intention, [key]: value } }));
  };

  const updateGoals = (key: keyof Goals, value: string) => {
    setState(prev => ({ ...prev, goals: { ...prev.goals, [key]: value } }));
  };
  
  const updateJournalEntry = (id: string, notes: string) => {
    setState(prev => ({
      ...prev,
      journal: prev.journal.map(entry => entry.id === id ? { ...entry, notes } : entry)
    }));
  };

  const updateJournalReflection = (journalId: string, date: string, field: keyof DailyReflection, value: string) => {
    setState(prev => ({
      ...prev,
      journal: prev.journal.map(entry => {
        if (entry.id !== journalId) return entry;
        const currentRef = entry.reflections[date] || { mood: '', gratitude: '', improvement: '' };
        return {
          ...entry,
          reflections: {
            ...entry.reflections,
            [date]: { ...currentRef, [field]: value }
          }
        };
      })
    }));
  };

  const updateDailyReflection = (date: string, field: keyof DailyReflection, value: string) => {
    setState(prev => {
      const current = prev.dailyReflections[date] || { mood: '', gratitude: '', improvement: '' };
      return {
        ...prev,
        dailyReflections: {
          ...prev.dailyReflections,
          [date]: { ...current, [field]: value }
        }
      };
    });
  };

  const endWeek = () => {
    const today = new Date();
    // Get week number
    const getWeek = (date: Date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    const weekNum = getWeek(today);
    const dateStr = today.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const weekLabel = `KW ${weekNum}`; 

    // Create a hard copy of tasks to avoid reference issues
    const allTasks = JSON.parse(JSON.stringify(state.tasks));
    
    const newEntry: JournalEntry = {
      id: generateId(),
      date: dateStr,
      archivedDate: dateStr,
      weekLabel,
      tasks: allTasks,
      reflections: JSON.parse(JSON.stringify(state.dailyReflections)),
      notes: ''
    };

    setState(prev => ({
      ...prev,
      tasks: [], 
      dailyReflections: {}, 
      journal: [newEntry, ...prev.journal] 
    }));
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      addTask, updateTask, deleteTask, 
      addPerson, 
      addHabit, deleteHabit, toggleHabitForDate,
      addWorkout, deleteWorkout, scheduleWorkout,
      endWeek, 
      updateIntention, updateGoals, 
      updateJournalEntry, updateDailyReflection, updateJournalReflection,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};