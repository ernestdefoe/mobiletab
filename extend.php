<?php

use Flarum\Extend;

return [
    new Extend\Locales(__DIR__ . '/resources/locale'),

    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    // Expose the configured tabs to the forum frontend. Empty/invalid → null,
    // and the bar falls back to its built-in default layout.
    (new Extend\Settings())
        ->serializeToForum('mobileTab', 'ernestdefoe-mobile-tab.tabs', function ($value) {
            $tabs = json_decode((string) $value, true);
            return is_array($tabs) && $tabs ? $tabs : null;
        }),
];
