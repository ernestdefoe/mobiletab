// Shared tab model used by the forum renderer and the admin editor.

export interface TabConfig {
  type: string; // home|tags|search|notifications|profile|new-discussion|login|logo|favicon|link
  icon?: string; // Font Awesome classes, e.g. "fas fa-home"
  label?: string;
  url?: string; // for type=link (relative route path or absolute URL)
  visibility?: 'all' | 'in' | 'out'; // everyone | logged-in | logged-out
  raised?: boolean; // render as the raised center action
}

export const TAB_TYPES = [
  'home',
  'tags',
  'search',
  'notifications',
  'profile',
  'new-discussion',
  'login',
  'logo',
  'favicon',
  'link',
] as const;

// Mirrors the original hardcoded bar, so behaviour is unchanged out of the box.
export const DEFAULT_TABS: TabConfig[] = [
  { type: 'home', icon: 'far fa-comments', label: 'Home', visibility: 'all' },
  { type: 'tags', icon: 'fas fa-tag', label: 'Tags', visibility: 'all' },
  { type: 'new-discussion', icon: 'fas fa-plus', label: '', visibility: 'in', raised: true },
  { type: 'notifications', icon: 'fas fa-bell', label: 'Notifications', visibility: 'in' },
  { type: 'profile', visibility: 'in' },
  { type: 'login', icon: 'fas fa-sign-in-alt', label: 'Log in', visibility: 'out' },
];
