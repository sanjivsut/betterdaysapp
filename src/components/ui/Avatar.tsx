/** Small circular initials avatar for the header profile affordance. */
export function Avatar({
  name,
  email,
  size = 32,
  className = '',
}: {
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  const source = (name || email || '?').trim();
  const initials = source
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || source[0]?.toUpperCase() || '?';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand/15 font-semibold text-brand-dark ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
