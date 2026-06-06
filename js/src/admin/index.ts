import Extend from 'flarum/common/extenders';
import TabEditor from './components/TabEditor';

const KEY = 'ernestdefoe-mobile-tab.';

export const extend = [
  new Extend.Admin()
    // The whole tab bar is configured through one custom component, bound to the
    // 'tabs' setting (a JSON string) via the AdminPage save stream.
    .customSetting(function (this: any) {
      return TabEditor.component({ stream: this.setting(KEY + 'tabs') });
    }, 100),
];
