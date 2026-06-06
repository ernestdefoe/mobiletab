import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import { TabConfig, DEFAULT_TABS, TAB_TYPES } from '../../common/tabs';

declare const m: any;

const t = (k: string) => app.translator.trans('ernestdefoe-mobile-tab.admin.' + k);

const TYPE_LABELS: Record<string, string> = {
  home: 'Home',
  tags: 'Tags',
  search: 'Search',
  notifications: 'Notifications',
  profile: 'Profile (avatar)',
  'new-discussion': 'New discussion',
  login: 'Log in',
  logo: 'Site logo',
  favicon: 'Favicon',
  link: 'Custom link',
};

const VIS_LABELS: Record<string, string> = { all: 'Everyone', in: 'Logged in', out: 'Logged out' };

const DEFAULT_ICONS: Record<string, string> = {
  home: 'far fa-comments',
  tags: 'fas fa-tag',
  search: 'fas fa-search',
  notifications: 'fas fa-bell',
  'new-discussion': 'fas fa-plus',
  login: 'fas fa-sign-in-alt',
  link: 'fas fa-link',
  logo: 'fas fa-image',
  favicon: 'fas fa-image',
  profile: 'fas fa-user-circle',
};

/** Full custom tab editor with a live preview, per-tab fields, and reordering. */
export default class TabEditor extends Component {
  tabs: TabConfig[] = [];

  oninit(vnode: any) {
    super.oninit(vnode);
    let parsed: any = null;
    try {
      const raw = this.attrs.stream();
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      parsed = null;
    }
    this.tabs = Array.isArray(parsed) && parsed.length ? parsed : JSON.parse(JSON.stringify(DEFAULT_TABS));
  }

  /** Persist the working config into the bound settings stream (marks the page dirty → Save). */
  commit() {
    this.attrs.stream(JSON.stringify(this.tabs));
  }

  glyph(tab: TabConfig) {
    return tab.icon || DEFAULT_ICONS[tab.type] || 'fas fa-circle';
  }

  view() {
    return m('.Form-group.MobileTabEditor', [
      m('label.MobileTabEditor-title', t('tabs_label')),
      m('p.helpText', t('tabs_help')),
      this.preview(),
      m('.MobileTabEditor-list', this.tabs.map((tab, i) => this.row(tab, i))),
      m('.MobileTabEditor-actions', [
        Button.component(
          { className: 'Button Button--primary Button--icon', icon: 'fas fa-plus', onclick: () => { this.tabs.push({ type: 'link', icon: 'fas fa-star', label: 'New', url: '/', visibility: 'all' }); this.commit(); } },
          t('add_tab')
        ),
        Button.component(
          { className: 'Button Button--text', icon: 'fas fa-rotate-left', onclick: () => { this.tabs = JSON.parse(JSON.stringify(DEFAULT_TABS)); this.commit(); } },
          t('reset_default')
        ),
      ]),
    ]);
  }

  /** A small live render of how the bar will look. */
  preview() {
    const chip = (tab: TabConfig) => {
      const icon = m('i', { className: this.glyph(tab) });
      if (tab.raised) {
        return m('.MobileTabPreview-tab.is-raised', { title: TYPE_LABELS[tab.type] || tab.type }, icon);
      }
      return m('.MobileTabPreview-tab', { title: TYPE_LABELS[tab.type] || tab.type }, [
        m('span.MobileTabPreview-icon', icon),
        tab.label ? m('span.MobileTabPreview-label', tab.label) : null,
      ]);
    };
    return m('.MobileTabPreview', [
      m('.MobileTabPreview-phone', m('.MobileTabPreview-bar', this.tabs.length ? this.tabs.map(chip) : m('span.MobileTabPreview-empty', '—'))),
      m('.MobileTabPreview-caption', t('preview_caption')),
    ]);
  }

  field(label: string, control: any, hidden = false) {
    return m('.MobileTabField', { style: hidden ? 'display:none' : '' }, [m('span.MobileTabField-label', label), control]);
  }

  row(tab: TabConfig, i: number) {
    const upd = (k: string, v: any) => { (tab as any)[k] = v; this.commit(); };
    const showIcon = !['profile', 'logo', 'favicon'].includes(tab.type);
    const showUrl = tab.type === 'link';

    return m('.MobileTabRow', { key: i }, [
      m('.MobileTabRow-order', [
        Button.component({ className: 'Button Button--icon MobileTabRow-moveBtn', icon: 'fas fa-chevron-up', disabled: i === 0, onclick: () => this.move(i, -1) }),
        m('span.MobileTabRow-num', i + 1),
        Button.component({ className: 'Button Button--icon MobileTabRow-moveBtn', icon: 'fas fa-chevron-down', disabled: i === this.tabs.length - 1, onclick: () => this.move(i, 1) }),
      ]),

      // Fields are ALWAYS rendered (irrelevant ones hidden) so the child set
      // never changes on type switch — otherwise Mithril mis-patches the unkeyed
      // inputs and values bleed between fields.
      m('.MobileTabRow-grid', [
        this.field(t('field_type'),
          m('select.FormControl', { value: tab.type, onchange: (e: any) => upd('type', e.target.value) },
            TAB_TYPES.map((ty) => m('option', { value: ty }, TYPE_LABELS[ty] || ty)))),

        this.field(t('field_icon'), m('.MobileTabRow-iconField', [
          m('span.MobileTabRow-iconPreview', m('i', { className: this.glyph(tab) })),
          m('input.FormControl', { placeholder: 'fas fa-home', value: tab.icon || '', oninput: (e: any) => upd('icon', e.target.value), style: showIcon ? '' : 'display:none' }),
          m('span.MobileTabRow-auto', { style: showIcon ? 'display:none' : '' }, tab.type === 'profile' ? 'avatar (auto)' : 'site image (auto)'),
        ])),

        this.field(t('field_label'), m('input.FormControl', { placeholder: 'optional', value: tab.label || '', oninput: (e: any) => upd('label', e.target.value) })),

        this.field(t('field_url'), m('input.FormControl', { placeholder: '/path or https://…', value: tab.url || '', oninput: (e: any) => upd('url', e.target.value) }), !showUrl),

        this.field(t('field_visibility'),
          m('select.FormControl', { value: tab.visibility || 'all', onchange: (e: any) => upd('visibility', e.target.value) },
            Object.keys(VIS_LABELS).map((k) => m('option', { value: k }, VIS_LABELS[k])))),

        this.field(t('field_center'),
          m('label.MobileTabRow-toggle', { title: t('raised') }, [
            m('input', { type: 'checkbox', checked: !!tab.raised, onchange: (e: any) => upd('raised', e.target.checked) }),
            m('span'),
          ])),
      ]),

      Button.component({ className: 'Button Button--icon MobileTabRow-remove', icon: 'fas fa-trash-alt', title: t('remove'), onclick: () => { this.tabs.splice(i, 1); this.commit(); } }),
    ]);
  }

  move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= this.tabs.length) return;
    const [x] = this.tabs.splice(i, 1);
    this.tabs.splice(j, 0, x);
    this.commit();
  }
}
