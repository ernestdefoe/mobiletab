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
  profile: 'Profile (avatar menu)',
  'new-discussion': 'New discussion',
  login: 'Log in',
  logo: 'Site logo',
  favicon: 'Favicon',
  link: 'Custom link',
};

const VIS_LABELS: Record<string, string> = { all: 'Everyone', in: 'Logged in', out: 'Logged out' };

/** Full custom tab editor: add/remove/reorder tabs, each with its own type, icon, label, destination, visibility, and raised flag. */
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
    // Show the saved config, or the default bar if nothing's saved yet.
    this.tabs = Array.isArray(parsed) && parsed.length ? parsed : JSON.parse(JSON.stringify(DEFAULT_TABS));
  }

  /** Persist the working config into the bound settings stream (marks the page dirty → Save). */
  commit() {
    this.attrs.stream(JSON.stringify(this.tabs));
  }

  view() {
    return m('.Form-group.MobileTabEditor', [
      m('label', t('tabs_label')),
      m('p.helpText', t('tabs_help')),
      m('.MobileTabEditor-list', this.tabs.map((tab, i) => this.row(tab, i))),
      m('.MobileTabEditor-actions', [
        Button.component(
          { className: 'Button', icon: 'fas fa-plus', onclick: () => { this.tabs.push({ type: 'link', icon: 'fas fa-star', label: 'New', url: '/', visibility: 'all' }); this.commit(); } },
          t('add_tab')
        ),
        Button.component(
          { className: 'Button Button--link', onclick: () => { this.tabs = JSON.parse(JSON.stringify(DEFAULT_TABS)); this.commit(); } },
          t('reset_default')
        ),
      ]),
    ]);
  }

  row(tab: TabConfig, i: number) {
    const upd = (k: string, v: any) => { (tab as any)[k] = v; this.commit(); };
    const showIcon = !['profile', 'logo', 'favicon'].includes(tab.type);
    const showUrl = tab.type === 'link';

    return m('.MobileTabRow', { key: i }, [
      m('.MobileTabRow-move', [
        Button.component({ className: 'Button Button--icon', icon: 'fas fa-chevron-up', disabled: i === 0, onclick: () => this.move(i, -1) }),
        Button.component({ className: 'Button Button--icon', icon: 'fas fa-chevron-down', disabled: i === this.tabs.length - 1, onclick: () => this.move(i, 1) }),
      ]),
      m('.MobileTabRow-fields', [
        m('select.FormControl.MobileTabRow-type', { value: tab.type, onchange: (e: any) => upd('type', e.target.value) },
          TAB_TYPES.map((ty) => m('option', { value: ty }, TYPE_LABELS[ty] || ty))),
        showIcon
          ? m('input.FormControl', { placeholder: 'icon e.g. fas fa-home', value: tab.icon || '', oninput: (e: any) => upd('icon', e.target.value) })
          : m('span.MobileTabRow-auto', tab.type === 'profile' ? 'avatar' : 'auto image'),
        m('input.FormControl', { placeholder: 'label (optional)', value: tab.label || '', oninput: (e: any) => upd('label', e.target.value) }),
        showUrl ? m('input.FormControl', { placeholder: '/path or https://…', value: tab.url || '', oninput: (e: any) => upd('url', e.target.value) }) : null,
        m('select.FormControl.MobileTabRow-vis', { value: tab.visibility || 'all', onchange: (e: any) => upd('visibility', e.target.value) },
          Object.keys(VIS_LABELS).map((k) => m('option', { value: k }, VIS_LABELS[k]))),
        m('label.MobileTabRow-raised', [
          m('input', { type: 'checkbox', checked: !!tab.raised, onchange: (e: any) => upd('raised', e.target.checked) }),
          ' ',
          t('raised'),
        ]),
      ]),
      Button.component({ className: 'Button Button--icon MobileTabRow-remove', icon: 'fas fa-times', onclick: () => { this.tabs.splice(i, 1); this.commit(); } }),
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
