import { Icon } from '@/components/ui/Icon';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

/** Three cards: streak, weekly completion ring, active habit count. */
export function StatStrip({
  bestStreak,
  weeklyCompletion,
  activeHabits,
}: {
  bestStreak: number;
  weeklyCompletion: number;
  activeHabits: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <Icon name="flame" className="text-xl text-brand" />
        <Value>{bestStreak}</Value>
        <Label>day streak</Label>
      </Card>
      <Card>
        <div className="relative flex items-center justify-center">
          <ProgressRing value={weeklyCompletion} />
          <span className="absolute text-[11px] font-semibold">
            {Math.round(weeklyCompletion * 100)}%
          </span>
        </div>
        <Label>this week</Label>
      </Card>
      <Card>
        <Icon name="trophy" className="text-xl text-warning" />
        <Value>{activeHabits}</Value>
        <Label>active habits</Label>
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card border border-border bg-surface px-2 py-3 text-center">
      {children}
    </div>
  );
}
function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-lg font-semibold leading-none">{children}</span>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] text-content-subtle">{children}</span>;
}
