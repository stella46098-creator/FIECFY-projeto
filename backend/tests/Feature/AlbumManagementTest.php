<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\Album;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AlbumManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_album_api_is_read_only(): void
    {
        $artist = Artist::factory()->create();
        $album = Album::factory()->create(['artist_id' => $artist->id]);
        $user = User::factory()->create();

        $this->getJson('/api/albums')
            ->assertOk()
            ->assertJsonPath('data.0.title', $album->title);
        $this->getJson("/api/albums/{$album->id}")
            ->assertOk()
            ->assertJsonPath('data.title', $album->title);
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/albums', [
                'artist_id' => $artist->id,
                'title' => 'Novo álbum',
                'release_year' => 2026,
            ])
            ->assertStatus(405);
        $this->actingAs($user, 'sanctum')
            ->putJson("/api/albums/{$album->id}", ['title' => 'Álbum alterado'])
            ->assertStatus(405);
        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/albums/{$album->id}")
            ->assertStatus(405);
        $this->actingAs($user, 'sanctum')
            ->getJson('/api/albums/mine')
            ->assertNotFound();
    }

    public function test_users_can_upload_a_full_mp3_to_a_song(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $album = Album::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/musicas', [
                'album_id' => $album->id,
                'title' => 'Faixa própria',
                'duration_seconds' => 180,
                'audio' => UploadedFile::fake()->create('faixa.mp3', 30, 'audio/mpeg'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Faixa própria');

        $song = Song::where('title', 'Faixa própria')->firstOrFail();
        $this->assertNotEmpty($response->json('data.audio_url'));
        Storage::disk('public')->assertExists($song->audio_path);
    }

    public function test_blinding_lights_album_uses_the_selected_cover(): void
    {
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $this->assertDatabaseHas('albums', [
            'title' => 'After Hours',
            'cover_image' => 'covers/blinding-lights-cover.jpg',
        ]);
    }
}
