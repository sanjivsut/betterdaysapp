/**
 * Notification trigger — STUB.
 *
 * The free tier gives each habit one fixed daily reminder. Delivery will be
 * handled by OneSignal (free tier) for scheduling reliability; Web Push via the
 * service worker is the transport. None of that is wired up yet.
 *
 * This module is the single seam where it plugs in. Callers (the reminder save
 * flow, a future scheduled function) call `sendHabitReminder` and it currently
 * just logs. Keep the signature stable so swapping in a real implementation is
 * a one-file change.
 */
import { limitsFor } from '@/lib/plan';

export interface HabitReminderPayload {
  userId: string;
  habitId: string;
  habitName: string;
  /** Local time the reminder is meant to fire, "HH:MM". */
  timeOfDay: string;
  timezone: string | null;
}

export async function sendHabitReminder(
  payload: HabitReminderPayload,
): Promise<{ delivered: boolean; provider: string }> {
  // TODO(push): integrate OneSignal REST API here. Read ONESIGNAL_APP_ID /
  // ONESIGNAL_API_KEY from env, look up the user's push_subscriptions rows,
  // and POST a notification. For now this is a no-op.
  if (process.env.NODE_ENV !== 'production') {
    console.info('[notifications:stub] would send reminder', payload);
  }
  return { delivered: false, provider: 'stub' };
}

/**
 * Free tier: exactly one reminder per habit. This helper is where a future
 * premium tier would allow multiple/custom schedules.
 */
export function maxRemindersForUser(user: { plan?: string | null }): number {
  return limitsFor(user).remindersPerHabit;
}
