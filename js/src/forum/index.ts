import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Avatar from 'flarum/common/components/Avatar';
import SessionDropdown from 'flarum/forum/components/SessionDropdown';

// ─────────────────────────────────────────────────────────────
// Extension ID — must match nameToId('resofire/mobile-tab')
// Flarum strips 'flarum-' and 'flarum-ext-' prefixes only,
// so: vendor=resofire, package=mobile-tab → resofire-mobile-tab
// ─────────────────────────────────────────────────────────────

const EXTENSION_ID = 'resofire-mobile-tab';
const MOUNT_ID = 'resofire-mobile-tab-mount';

// ─────────────────────────────────────────────────────────────
// Active route helper
// app.current.data.routeName is set by Flarum's route resolver
// before each page renders, giving us the registered route key.
// ─────────────────────────────────────────────────────────────

function isRoute(name: string): boolean {
    return app.current.data.routeName === name;
}

// ─────────────────────────────────────────────────────────────
// BottomBar component
// Always mounted to document.body. CSS controls visibility:
//   @tablet-up → display:none  (hidden on tablet and desktop)
//   @phone     → shown
// This avoids JS viewport detection at mount time which can
// race with resize events.
// ─────────────────────────────────────────────────────────────

const BottomBar = {
    view() {
        const user = app.session.user;
        const unread = user ? (user.unreadNotificationCount() || 0) : 0;
        const canStart = app.forum.attribute('canStartDiscussion') || !user;
        // Guard: app.route('tags') throws if the tags extension is disabled.
        // Check the route registry before attempting to call it.
        const hasTags = 'tags' in app.routes;

        // ── Logged-out: Home · Tags · Log In ─────────────────
        if (!user) {
            return m('div.MobileTab-bar', [

                // Home
                m('a.MobileTab-tab', {
                    href: app.route('index'),
                    oncreate: m.route.link,
                    class: isRoute('index') ? 'active' : '',
                }, [
                    m('span.MobileTab-tab-icon', m('i.far.fa-comments')),
                    m('span.MobileTab-tab-label', 'Home'),
                ]),

                // Tags
                hasTags ? m('a.MobileTab-tab', {
                    href: app.route('tags'),
                    oncreate: m.route.link,
                    class: isRoute('tags') ? 'active' : '',
                }, [
                    m('span.MobileTab-tab-icon', m('i.fas.fa-tag')),
                    m('span.MobileTab-tab-label', 'Tags'),
                ]) : null,

                // Log In
                m('button.MobileTab-tab', {
                    onclick: () => app.modal.show(() => import('flarum/forum/components/LogInModal')),
                }, [
                    m('span.MobileTab-tab-icon', m('i.fas.fa-sign-in-alt')),
                    m('span.MobileTab-tab-label', 'Log in'),
                ]),

            ]);
        }

        // ── Logged-in: Home · Tags · [+] · Notifications · Profile ──
        return m('div.MobileTab-bar', [

            // Home
            m('a.MobileTab-tab', {
                href: app.route('index'),
                oncreate: m.route.link,
                class: isRoute('index') ? 'active' : '',
            }, [
                m('span.MobileTab-tab-icon', m('i.far.fa-comments')),
                m('span.MobileTab-tab-label', 'Home'),
            ]),

            // Tags
            hasTags ? m('a.MobileTab-tab', {
                href: app.route('tags'),
                oncreate: m.route.link,
                class: isRoute('tags') ? 'active' : '',
            }, [
                m('span.MobileTab-tab-icon', m('i.fas.fa-tag')),
                m('span.MobileTab-tab-label', 'Tags'),
            ]) : null,

            // + New Discussion — raised FAB, ~20% above bar top edge
            canStart ? m('button.MobileTab-bar-plus', {
                onclick: () => {
                    app.composer
                        .load(() => import('flarum/forum/components/DiscussionComposer'), { user })
                        .then(() => app.composer.show());
                },
            }, m('i.fas.fa-plus')) : null,

            // Notifications
            m('a.MobileTab-tab', {
                href: app.route('notifications'),
                oncreate: m.route.link,
                class: isRoute('notifications') ? 'active' : '',
            }, [
                m('span.MobileTab-tab-icon', [
                    m('i.fas.fa-bell'),
                    unread > 0 ? m('span.MobileTab-tab-badge',
                        unread > 99 ? '99+' : unread
                    ) : null,
                ]),
                m('span.MobileTab-tab-label', 'Notifications'),
            ]),

            // Profile tab — two-layer approach:
            //
            // Layer 1 (visual): Our own Avatar + "Profile" label,
            // rendered as a proper flex-column tab identical in
            // structure to every other tab.
            //
            // Layer 2 (interactive): SessionDropdown rendered with
            // visibility:hidden so it exists in the DOM and Bootstrap
            // can initialize its [data-toggle="dropdown"] binding on
            // the button, but the button is never seen. We attach an
            // onclick to the tab wrapper that programmatically calls
            // jQuery's .dropdown('toggle') on the hidden button,
            // which fires Bootstrap's dropdown exactly as if the user
            // had clicked the button directly.
            m('div.MobileTab-tab.MobileTab-tab--session', {
                onclick: (e: Event) => {
                    // Find the hidden Dropdown-toggle button and trigger it
                    const btn = (e.currentTarget as HTMLElement)
                        .querySelector('.Dropdown-toggle') as HTMLElement | null;
                    if (btn) $(btn).dropdown('toggle');
                },
            }, [

                // Layer 1 — visible tab content
                m('span.MobileTab-tab-icon',
                    m(Avatar, { user, 'aria-hidden': 'true' })
                ),
                m('span.MobileTab-tab-label', 'Profile'),

                // Layer 2 — SessionDropdown, hidden but DOM-present
                // so Bootstrap initialises its event binding.
                // visibility:hidden preserves layout space but hides
                // it; position:absolute takes it out of flow entirely.
                m('div.MobileTab-tab-sessionTrigger',
                    m(SessionDropdown)
                ),

            ]),

        ]);
    },
};

// ─────────────────────────────────────────────────────────────
// Initializer
// ─────────────────────────────────────────────────────────────

app.initializers.add(EXTENSION_ID, () => {

    // Mount the bar to document.body inside app.mount() so that
    // all Flarum DOM nodes exist before we append our mount point.
    // Guard with the mount ID so hot-reloads don't double-mount.
    extend(app, 'mount', () => {
        if (document.getElementById(MOUNT_ID)) return;

        const el = document.createElement('div');
        el.id = MOUNT_ID;
        document.body.appendChild(el);
        m.mount(el, BottomBar);
    });

    // Patch m.route.set so the bar redraws on every navigation.
    // This keeps the active tab highlight and unread count current.
    const origRouteSet = m.route.set.bind(m.route);
    m.route.set = function (...args: Parameters<typeof m.route.set>) {
        const result = origRouteSet(...args);
        m.redraw();
        return result;
    };

});
