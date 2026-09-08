import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'onColor'
  | 'onColorOutline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary:
    'bg-surface text-content border border-border hover:bg-surface-muted',
  ghost: 'text-content-muted hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90',
  // For use on the brand gradient / any dark or coloured surface.
  onColor: 'bg-white text-brand-dark hover:bg-white/90',
  onColorOutline:
    'border border-white/70 text-white hover:bg-white/10 bg-transparent',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type AnchorProps = CommonProps & { as: 'link'; href: string } & Omit<
    React.ComponentProps<typeof Link>,
    'href'
  >;

export const Button = forwardRef<HTMLButtonElement, ButtonProps | AnchorProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      className,
      ...rest
    } = props as CommonProps & Record<string, unknown>;

    // cn() runs the caller's className through tailwind-merge last, so an
    // override like `className="bg-white text-brand-dark"` reliably wins.
    const cls = cn(base, variants[variant], sizes[size], className);

    if ((props as AnchorProps).as === 'link') {
      const { as: _as, ...anchorRest } = rest as { as?: string; href: string };
      return <Link className={cls} {...(anchorRest as { href: string })} />;
    }
    const { as: _as, ...buttonRest } = rest as { as?: string };
    return <button ref={ref} className={cls} {...(buttonRest as object)} />;
  },
);
