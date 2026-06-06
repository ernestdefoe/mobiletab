# Mobile Tab Bar

A configurable mobile bottom tab bar for **Flarum 2.x**. On phones, a native-app-style
bar is pinned to the bottom of the screen; on tablet and desktop it's hidden.

## Features

- 🧱 **Full custom tab editor** — build the bar yourself in admin: add, remove, and
  reorder tabs.
- 🎛️ **Per-tab settings** — each tab has a **type**, a **Font Awesome icon**, a
  **label**, a **visibility** (everyone / logged-in / logged-out), and an optional
  **raised** flag (the lifted center button).
- 🧩 **Tab types** — Home, Tags, Search, Notifications, Profile (avatar menu),
  New discussion, Log in, **Site logo**, **Favicon**, or a **custom link**
  (internal route or external URL).
- 🖼️ **Logo / favicon in the middle** — drop a Site logo or Favicon tile anywhere,
  including the raised center slot.
- 🔢 Live unread badge on the Notifications tab, active-route highlighting, and a
  `html.has-mobile-tab` hook for themes that need to shift content above the bar.

Leave the tab list empty to use the sensible default bar
(Home · Tags · ＋ · Notifications · Profile).

## Installation

```bash
composer require ernestdefoe/mobile-tab
php flarum cache:clear
```

Enable it in **Admin → Extensions**, then configure the bar under its settings.

## Configuring the bar

Open the extension's settings page and use the **Bottom bar tabs** editor:

1. **Add tab** to append a row, or reorder with the ▲ ▼ arrows.
2. Pick a **type**, set an **icon** (e.g. `fas fa-home`) and **label**.
3. Choose **visibility** and tick **Raised** for the center action.
4. For **Custom link**, enter a path (`/tags/support`) or URL (`https://…`).
5. **Save Changes.** (Site logo / Favicon types pull your site image automatically.)

## Credits

Originally created by [resofire](https://github.com/resofire). Rebranded and
extended (configurable tab editor, logo/favicon slots) by
[ernestdefoe](https://github.com/ernestdefoe), with full credit to the original author.

## License

MIT — © ResofireV2 (original author).
