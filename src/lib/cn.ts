import { twMerge } from 'tailwind-merge';

/**
 * Join class names and let later (caller-supplied) Tailwind utilities win over
 * earlier ones — e.g. a `className` prop can override a component's default
 * `bg-*` / `text-*` without class-order surprises.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return twMerge(parts.filter(Boolean).join(' '));
}
