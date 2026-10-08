<?php

namespace ErnestDefoe\MobileTab\Tests\integration\forum;

use Flarum\Foundation\Paths;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * The extension's LESS compiles into each frontend's stylesheet: a LESS error
 * here takes the whole page down, not just the tab bar. One page per test,
 * as each render compiles the assets.
 */
class AssetsTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-mobile-tab');
    }

    /**
     * The assets a page render compiles, removed first so they are this
     * render's own.
     *
     * @return list<string>
     */
    private function compiledBy(array $files, callable $render): array
    {
        $dir = $this->app()->getContainer()->make(Paths::class)->public.'/assets/';
        foreach ($files as $file) {
            @unlink($dir.$file);
        }

        $render();

        return array_map(fn ($file) => (string) @file_get_contents($dir.$file), $files);
    }

    #[Test]
    public function the_forum_renders_with_the_tab_bar_styles()
    {
        [$css] = $this->compiledBy(['forum.css'], function () {
            $this->assertSame(200, $this->send($this->request('GET', '/'))->getStatusCode());
        });

        $this->assertStringContainsString('.MobileTab-bar', $css);
    }

    #[Test]
    public function the_admin_renders_with_the_editor_styles()
    {
        [$css] = $this->compiledBy(['admin.css'], function () {
            $this->assertSame(200, $this->send($this->request('GET', '/admin', ['authenticatedAs' => 1]))->getStatusCode());
        });

        $this->assertStringContainsString('.MobileTabEditor', $css);
    }
}
