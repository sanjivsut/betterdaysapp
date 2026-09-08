/**
 * Feature gating.
 *
 * The MVP ships a single free tier. Payments / subscription logic are NOT built
 * in this pass — this module is the extension point. Every premium check goes
 * through the helpers here so that adding paid tiers later is a change in one
 * file plus wiring a real `plan` value onto the user, not a rewrite.
 */

export type Plan = 'free' | 'premium';

export interface PlanUser {
  plan?: Plan | string | null;
}

/** Always false for now. Flip this on once billing exists. */
export function isPremium(_user?: PlanUser | null): boolean {
  return false;
}

/** Free-tier limits. Premium would raise or remove these. */
export const planLimits = {
  free: {
    maxHabits: 12,
    remindersPerHabit: 1, // single fixed daily reminder
    personalizedInsights: false, // rule-based tips only
    historyDays: 365,
  },
  premium: {
    maxHabits: Infinity,
    remindersPerHabit: Infinity,
    personalizedInsights: true,
    historyDays: Infinity,
  },
} as const;

export function limitsFor(user?: PlanUser | null) {
  return isPremium(user) ? planLimits.premium : planLimits.free;
}
