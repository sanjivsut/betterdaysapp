/**
 * Insights — rule-based v1.
 *
 * This is deliberately simple: a handful of deterministic rules over the user's
 * own log history. It is designed to be REPLACED later by pattern detection
 * over the free-text context notes (the natural premium "personalized insights"
 * feature). Keep the return shape (`Insight`) stable so the UI doesn't change
 * when the engine is upgraded — only this file should need to change.
 */

export interface InsightInput {
  habitId: string;
  habitName: string;
  type: 'build' | 'break';
  baselineValue: number | null;
  entries: Array<{ value: number; kind: 'good' | 'slip'; loggedAt: Date }>;
}

export interface Insight {
  id: string;
  habitId: string | null;
  /** Short, human sentence shown in the banner / insights list. */
  text: string;
  tone: 'positive' | 'neutral' | 'watch';
}

const DAY = 24 * 60 * 60 * 1000;

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Rule: slips cluster on weekends. */
function weekendSlipRule(input: InsightInput): Insight | null {
  const slips = input.entries.filter((e) => e.kind === 'slip');
  if (slips.length < 4) return null;
  const weekendSlips = slips.filter((e) => isWeekend(e.loggedAt)).length;
  const share = weekendSlips / slips.length;
  // Weekends are ~2/7 of days; flag if clearly over-represented.
  if (share >= 0.5) {
    return {
      id: `${input.habitId}:weekend-slips`,
      habitId: input.habitId,
      text: `Your ${input.habitName.toLowerCase()} slips cluster around weekends — ${weekendSlips} of your last ${slips.length}.`,
      tone: 'watch',
    };
  }
  return null;
}

/** Rule: recent average is below the user's own baseline (a "break" win). */
function belowBaselineRule(input: InsightInput): Insight | null {
  if (input.type !== 'break' || input.baselineValue == null) return null;
  const recent = input.entries.filter(
    (e) => Date.now() - e.loggedAt.getTime() <= 14 * DAY,
  );
  if (recent.length < 3) return null;
  const avg = recent.reduce((s, e) => s + e.value, 0) / recent.length;
  if (avg < input.baselineValue) {
    const pct = Math.round((1 - avg / input.baselineValue) * 100);
    return {
      id: `${input.habitId}:below-baseline`,
      habitId: input.habitId,
      text: `Over the last two weeks you're averaging ${avg.toFixed(1)} on ${input.habitName.toLowerCase()} — about ${pct}% below your usual ${input.baselineValue}.`,
      tone: 'positive',
    };
  }
  return null;
}

/** Rule: a build streak is running. */
function buildStreakRule(input: InsightInput): Insight | null {
  if (input.type !== 'build') return null;
  const days = new Set(
    input.entries
      .filter((e) => e.kind === 'good')
      .map((e) => e.loggedAt.toISOString().slice(0, 10)),
  );
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
    if (days.has(d)) streak++;
    else if (i > 0) break;
  }
  if (streak >= 3) {
    return {
      id: `${input.habitId}:build-streak`,
      habitId: input.habitId,
      text: `${streak}-day streak on ${input.habitName.toLowerCase()}. Keep the chain going.`,
      tone: 'positive',
    };
  }
  return null;
}

const RULES = [belowBaselineRule, buildStreakRule, weekendSlipRule];

export function computeInsights(inputs: InsightInput[]): Insight[] {
  const out: Insight[] = [];
  for (const input of inputs) {
    for (const rule of RULES) {
      const hit = rule(input);
      if (hit) out.push(hit);
    }
  }
  if (out.length === 0) {
    out.push({
      id: 'default',
      habitId: null,
      text: 'Add a few more days of entries and patterns from your notes will start to show up here.',
      tone: 'neutral',
    });
  }
  return out;
}

/** The single insight surfaced on the dashboard banner. */
export function primaryInsight(inputs: InsightInput[]): Insight {
  const all = computeInsights(inputs);
  return (
    all.find((i) => i.tone === 'watch') ??
    all.find((i) => i.tone === 'positive') ??
    all[0]
  );
}
