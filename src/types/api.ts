import type { Habit, HabitStat, LogEntry } from '@/lib/habits';
import type { Insight } from '@/lib/insights';

export interface DashboardCard {
  habit: Habit;
  stat: HabitStat;
  todayEntries: LogEntry[];
}

export interface DashboardResponse {
  stats: {
    bestStreak: number;
    weeklyCompletion: number;
    activeHabits: number;
  };
  cards: DashboardCard[];
  insight: Insight | null;
}

export type { Habit, HabitStat, LogEntry, Insight };
