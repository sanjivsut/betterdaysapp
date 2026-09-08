import type { Habit, TrendDirection } from '@/lib/habits';

/**
 * Maps a habit to its icon badge (icon + tint) and its trend styling so the
 * list is scannable by colour/shape, not just text. The badge tint reflects the
 * habit's semantic state; the good/bad signal is always also carried by the
 * trend arrow + words (never colour alone).
 */

const CATEGORY_ICONS: Record<string, string> = {
  sugar: 'cookie',
  food: 'salad',
  alcohol: 'glass',
  smoking: 'cigarette',
  caffeine: 'coffee',
  'screen time': 'device-mobile',
  phone: 'device-mobile',
  spending: 'coin',
  walk: 'walk',
  run: 'run',
  exercise: 'barbell',
  gym: 'barbell',
  water: 'droplet',
  sleep: 'moon',
  reading: 'book',
  meditation: 'yoga',
  study: 'school',
  journaling: 'notebook',
};

export function habitIcon(habit: Habit): string {
  const key = (habit.category ?? habit.name).toLowerCase().trim();
  if (CATEGORY_ICONS[key]) return CATEGORY_ICONS[key];
  const partial = Object.keys(CATEGORY_ICONS).find((k) => key.includes(k));
  if (partial) return CATEGORY_ICONS[partial];
  return habit.type === 'build' ? 'plant-2' : 'circle-minus';
}

export interface BadgeStyle {
  wrap: string; // background + text colour classes for the badge
}

export function habitBadge(
  habit: Habit,
  trend: TrendDirection,
): BadgeStyle {
  // "Break" habits: coral/danger tint. "Build" habits: success tint.
  // A regressing habit of either kind gets the warning tint.
  if (trend === 'regression') {
    return { wrap: 'bg-warning/15 text-warning' };
  }
  if (habit.type === 'build') {
    return { wrap: 'bg-success/12 text-success' };
  }
  return { wrap: 'bg-danger/12 text-danger' };
}

export function trendStyle(
  direction: TrendDirection,
  habitType: Habit['type'],
): { text: string; icon: string | null } {
  if (direction === 'improvement') {
    // Build: more activity is up. Break: less of the thing is down.
    return {
      text: 'text-success',
      icon: habitType === 'build' ? 'arrow-up' : 'arrow-down',
    };
  }
  if (direction === 'regression') {
    return {
      text: 'text-danger',
      icon: habitType === 'build' ? 'arrow-down' : 'arrow-up',
    };
  }
  return { text: 'text-content-subtle', icon: null };
}
