/**
 * Single source of truth for the authenticated app's primary navigation.
 * The mobile bottom tab bar and the tablet/desktop sidebar both render from
 * this list — the route set is never duplicated.
 */
export interface NavItem {
  href: string;
  label: string;
  /** Tabler outline icon name (webfont class is `ti ti-<icon>`). */
  icon: string;
}

export const appNav: NavItem[] = [
  { href: '/app/dashboard', label: 'Home', icon: 'home' },
  { href: '/app/progress', label: 'Progress', icon: 'chart-bar' },
  { href: '/app/insights', label: 'Insights', icon: 'bulb' },
  { href: '/app/settings', label: 'Settings', icon: 'settings' },
];
