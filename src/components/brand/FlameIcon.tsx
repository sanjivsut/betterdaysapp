import type { SVGProps } from 'react';

/**
 * The Better Days flame mark. The path is finalized — do not redraw it.
 * Used for the favicon, PWA icon, header lockup and the splash animation.
 */
export function FlameIcon({
  title,
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 49 76"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M25 0 C 11 21, 0 36, 3 56 C 5 68, 16 76, 25 76 C 34 76, 45 68, 47 56 C 49 46, 42 38, 39 41 C 39 50, 32 55, 28 50 C 23 43, 28 34, 19 23 C 14 32, 10 37, 10 42 C 5 37, 10 23, 25 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}
