import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import SessionDropdown from 'flarum/forum/components/SessionDropdown';
import { TabConfig, DEFAULT_TABS } from '../common/tabs';

declare const m: any;

// Extension ID — must match nameToId('ernestdefoe/mobile-tab').
const EXTENSION_ID = 'ernestdefoe-mobile-tab';
const MOUNT_ID = 'ernestdefoe-mobile-tab-mount';

function isRoute(name: string): boolean {
  return app.current?.data?.routeName === name;
}

/** Admin-configured tabs (serialized from settings), falling back to the default bar. */
function configuredTabs(): TabConfig[] {
  const cfg = app.forum.attribute('mobileTab');
  return Array.isArray(cfg) && cfg.length ? (cfg as TabConfig[]) : DEFAULT_TABS;
}

function visibleTo(tab: TabConfig, loggedIn: boolean): boolean {
  const v = tab.visibility || 'all';
  if (v === 'in') return loggedIn;
  if (v === 'out') return !loggedIn;
  return true;
}

function iconNode(tab: TabConfig, fallback: string) {
  return m('i', { className: tab.icon || fallback });
}
function labelNode(tab: TabConfig, fallback = '') {
  const text = tab.label ?? fallback;
  return text ? m('span.MobileTab-tab-label', text) : null;
}
function routeTab(href: string, routeName: string, tab: TabConfig, fallbackIcon: string) {
  return m('a.MobileTab-tab', { href, oncreate: m.route.link, class: isRoute(routeName) ? 'active' : '' }, [
    m('span.MobileTab-tab-icon', iconNode(tab, fallbackIcon)),
    labelNode(tab),
  ]);
}

function renderTab(tab: TabConfig) {
  const user = app.session.user;

  switch (tab.type) {
    case 'home':
      return routeTab(app.route('index'), 'index', tab, 'far fa-comments');

    case 'tags':
      return 'tags' in app.routes ? routeTab(app.route('tags'), 'tags', tab, 'fas fa-tag') : null;

    case 'notifications': {
      if (!user) return null;
      const unread = user.unreadNotificationCount() || 0;
      return m('a.MobileTab-tab', { href: app.route('notifications'), oncreate: m.route.link, class: isRoute('notifications') ? 'active' : '' }, [
        m('span.MobileTab-tab-icon', [
          iconNode(tab, 'fas fa-bell'),
          unread > 0 ? m('span.MobileTab-tab-badge', unread > 99 ? '99+' : unread) : null,
        ]),
        labelNode(tab),
      ]);
    }

    case 'profile':
      return user ? m('div.MobileTab-tab.MobileTab-tab--session', m(SessionDropdown)) : null;

    case 'login':
      return user
        ? null
        : m('button.MobileTab-tab', { onclick: () => app.modal.show(() => import('flarum/forum/components/LogInModal')) }, [
            m('span.MobileTab-tab-icon', iconNode(tab, 'fas fa-sign-in-alt')),
            labelNode(tab, 'Log in'),
          ]);

    case 'search':
      return m('button.MobileTab-tab', {
        onclick: () => (document.querySelector('.Search input, #header-search input') as HTMLElement | null)?.focus(),
      }, [m('span.MobileTab-tab-icon', iconNode(tab, 'fas fa-search')), labelNode(tab, 'Search')]);

    case 'new-discussion': {
      if (!user || !app.forum.attribute('canStartDiscussion')) return null;
      const onclick = () =>
        app.composer.load(() => import('flarum/forum/components/DiscussionComposer'), { user }).then(() => app.composer.show());
      return tab.raised
        ? m('button.MobileTab-bar-plus', { onclick }, iconNode(tab, 'fas fa-plus'))
        : m('button.MobileTab-tab', { onclick }, [m('span.MobileTab-tab-icon', iconNode(tab, 'fas fa-plus')), labelNode(tab, 'New')]);
    }

    case 'logo':
    case 'favicon': {
      const logo = app.forum.attribute('logoUrl');
      const fav = app.forum.attribute('faviconUrl');
      const src = tab.type === 'logo' ? logo || fav : fav || logo;
      const img = src ? m('img.MobileTab-tab-logo', { src, alt: '' }) : iconNode(tab, 'fas fa-home');
      if (tab.raised) {
        return m('a.MobileTab-bar-plus.MobileTab-bar-plus--logo', { href: app.route('index'), oncreate: m.route.link }, img);
      }
      return m('a.MobileTab-tab', { href: app.route('index'), oncreate: m.route.link, class: isRoute('index') ? 'active' : '' }, [
        m('span.MobileTab-tab-icon', img),
        labelNode(tab),
      ]);
    }

    case 'link': {
      if (!tab.url) return null;
      const external = /^(https?:|mailto:)/i.test(tab.url);
      const attrs = external ? { href: tab.url, target: '_blank', rel: 'noopener' } : { href: tab.url, oncreate: m.route.link };
      return tab.raised
        ? m('a.MobileTab-bar-plus', attrs, iconNode(tab, 'fas fa-link'))
        : m('a.MobileTab-tab', attrs, [m('span.MobileTab-tab-icon', iconNode(tab, 'fas fa-link')), labelNode(tab)]);
    }

    default:
      return null;
  }
}

const BottomBar = {
  view() {
    const loggedIn = !!app.session.user;
    const nodes = configuredTabs()
      .filter((t) => visibleTo(t, loggedIn))
      .map((t) => renderTab(t))
      .filter(Boolean);
    return m('div.MobileTab-bar', nodes);
  },
};

app.initializers.add(EXTENSION_ID, () => {
  extend(app, 'mount', () => {
    if (document.getElementById(MOUNT_ID)) return;

    const el = document.createElement('div');
    el.id = MOUNT_ID;
    document.body.appendChild(el);
    m.mount(el, BottomBar);

    document.documentElement.classList.add('has-mobile-tab');
  });

  // Redraw the bar on every navigation (keeps active highlight + unread fresh).
  const origRouteSet = m.route.set.bind(m.route);
  m.route.set = function (...args: Parameters<typeof m.route.set>) {
    const result = origRouteSet(...args);
    m.redraw();
    return result;
  };
});
