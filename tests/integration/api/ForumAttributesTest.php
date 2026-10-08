<?php

namespace ErnestDefoe\MobileTab\Tests\integration\api;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

/**
 * The configured tabs reach the forum as mobileTab; anything that is not a
 * non-empty list reaches it as null, so the bar falls back to its defaults.
 */
class ForumAttributesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-mobile-tab');
    }

    private function mobileTab(): mixed
    {
        $response = $this->send($this->request('GET', '/api'));
        $this->assertSame(200, $response->getStatusCode());

        $attributes = json_decode((string) $response->getBody(), true)['data']['attributes'];
        $this->assertArrayHasKey('mobileTab', $attributes);

        return $attributes['mobileTab'];
    }

    #[Test]
    public function the_configured_tabs_are_sent_to_the_forum()
    {
        $tabs = [['icon' => 'fas fa-home', 'label' => 'Home', 'url' => '/'], ['icon' => 'fas fa-bell', 'label' => 'Alerts', 'url' => '/notifications']];
        $this->setting('ernestdefoe-mobile-tab.tabs', json_encode($tabs));

        $this->assertSame($tabs, $this->mobileTab());
    }

    public static function unusable(): array
    {
        return [
            'never saved' => [null],
            'empty list' => ['[]'],
            'not JSON' => ['{oops'],
            'a string' => ['"tabs"'],
        ];
    }

    #[Test]
    #[DataProvider('unusable')]
    public function anything_else_is_sent_as_null(?string $value)
    {
        if ($value !== null) {
            $this->setting('ernestdefoe-mobile-tab.tabs', $value);
        }

        $this->assertNull($this->mobileTab());
    }
}
