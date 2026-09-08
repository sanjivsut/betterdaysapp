/**
 * Thin wrapper over the Tabler outline icon webfont. Usage:
 *   <Icon name="home" />  ->  <i class="ti ti-home" />
 * The webfont CSS is imported once in the root layout.
 */
export function Icon({
  name,
  className = '',
  label,
}: {
  name: string;
  className?: string;
  label?: string;
}) {
  return (
    <i
      className={`ti ti-${name} ${className}`}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    />
  );
}
