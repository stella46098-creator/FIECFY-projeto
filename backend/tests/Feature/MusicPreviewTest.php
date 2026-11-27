<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Song;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MusicPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_catalog_is_a_curated_set_of_real_artists_and_tracks(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(6, Artist::count());
        $this->assertSame(6, Song::count());
        $this->assertDatabaseHas('songs', [
            'title' => 'Planos',
            'audio_path' => 'songs/planos.mp3',
        ]);
        $this->assertDatabaseHas('songs', [
            'title' => 'Blinding Lights',
            'audio_path' => 'songs/blinding-lights.mp3',
        ]);
        $this->assertDatabaseHas('songs', [
            'title' => 'Ocean Eyes',
            'audio_path' => 'songs/ocean-eyes.mp3',
        ]);
        $this->assertDatabaseHas('songs', [
            'title' => 'Levitating',
            'audio_path' => 'songs/levitating.mp3',
        ]);
        $this->assertDatabaseHas('songs', [
            'title' => 'Viva La Vida',
            'audio_path' => 'songs/viva-la-vida.mp3',
        ]);
        $this->assertTrue(Storage::disk('public')->exists('songs/viva-la-vida.mp3'));
        $this->assertDatabaseHas('songs', [
            'title' => 'Anti-Hero',
            'audio_path' => 'songs/anti-hero.mp3',
        ]);
        $this->assertTrue(Storage::disk('public')->exists('songs/anti-hero.mp3'));
        $this->assertDatabaseHas('albums', [
            'title' => "Don't Smile at Me",
            'cover_image' => 'covers/ocean-eyes-cover.jpg',
        ]);
        $this->assertDatabaseHas('albums', [
            'title' => 'Future Nostalgia',
            'cover_image' => 'covers/levitating-cover.jpg',
        ]);
        $this->assertDatabaseHas('albums', [
            'title' => 'Gigantes',
            'cover_image' => 'covers/planos-cover.jpg',
        ]);
        $this->assertDatabaseHas('albums', [
            'title' => 'Viva la Vida or Death and All His Friends',
            'cover_image' => 'covers/viva-la-vida-cover.jpg',
        ]);
        $this->assertTrue(Storage::disk('public')->exists('covers/viva-la-vida-cover.jpg'));
        $this->assertDatabaseHas('albums', [
            'title' => 'Midnights',
            'cover_image' => 'covers/anti-hero-cover.jpg',
        ]);
        $this->assertTrue(Storage::disk('public')->exists('covers/anti-hero-cover.jpg'));

        $this->seed(DatabaseSeeder::class);

        $this->assertSame(6, Artist::count());
        $this->assertSame(6, Song::count());
    }

    public function test_it_finds_a_preview_when_the_track_title_includes_a_featured_artist(): void
    {
        $artist = Artist::factory()->create(['name' => 'BK']);
        $album = Album::factory()->create([
            'artist_id' => $artist->id,
            'title' => 'Gigantes',
        ]);
        $song = Song::factory()->create([
            'album_id' => $album->id,
            'title' => 'Planos',
        ]);

        Http::fake([
            'itunes.apple.com/search*' => Http::response([
                'results' => [
                    [
                        'trackName' => 'Planos (feat. Luccas Carlos)',
                        'artistName' => 'BK',
                        'previewUrl' => 'https://audio.example/planos.m4a',
                        'artworkUrl100' => 'https://images.example/planos.jpg',
                        'trackViewUrl' => 'https://music.example/planos',
                    ],
                ],
            ]),
        ]);

        $this->getJson("/api/musicas/{$song->id}/preview")
            ->assertOk()
            ->assertJsonPath('preview_url', 'https://audio.example/planos.m4a')
            ->assertJsonPath('store_url', 'https://music.example/planos');
    }
}
