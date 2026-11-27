<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::firstOrCreate(
            ['email' => 'teste@fiecfy.com'],
            ['name' => 'Usuário FIECFY', 'password' => '12345678']
        );

        $artists = collect([
            'Billie Eilish',
            'The Weeknd',
            'Dua Lipa',
            'Coldplay',
            'BK',
            'Taylor Swift',
        ])->mapWithKeys(function ($name) {
            return [$name => Artist::firstOrCreate(['name' => $name])];
        });

        $albums = collect([
            ['artist' => 'Billie Eilish', 'title' => "Don't Smile at Me", 'release_year' => 2017, 'cover_image' => 'covers/ocean-eyes-cover.jpg'],
            ['artist' => 'The Weeknd', 'title' => 'After Hours', 'release_year' => 2020, 'cover_image' => 'covers/blinding-lights-cover.jpg'],
            ['artist' => 'Dua Lipa', 'title' => 'Future Nostalgia', 'release_year' => 2020, 'cover_image' => 'covers/levitating-cover.jpg'],
            ['artist' => 'Coldplay', 'title' => 'Viva la Vida or Death and All His Friends', 'release_year' => 2008, 'cover_image' => 'covers/viva-la-vida-cover.jpg'],
            ['artist' => 'BK', 'title' => 'Gigantes', 'release_year' => 2018, 'cover_image' => 'covers/planos-cover.jpg'],
            ['artist' => 'Taylor Swift', 'title' => 'Midnights', 'release_year' => 2022, 'cover_image' => 'covers/anti-hero-cover.jpg'],
        ])->mapWithKeys(function ($album) use ($artists) {
            $record = Album::firstOrCreate(
                [
                    'artist_id' => $artists[$album['artist']]->id,
                    'title' => $album['title'],
                ],
                ['release_year' => $album['release_year']]
            );
            if (isset($album['cover_image'])) {
                $record->update(['cover_image' => $album['cover_image']]);
            }

            return [$album['artist'] => $record];
        });

        $playlist = Playlist::firstOrCreate(
            ['user_id' => $demoUser->id, 'name' => 'Favoritas']
        );
        $songs = [
            ['artist' => 'Billie Eilish', 'title' => 'Ocean Eyes', 'duration_seconds' => 200, 'track_number' => 7, 'audio_path' => 'songs/ocean-eyes.mp3'],
            ['artist' => 'The Weeknd', 'title' => 'Blinding Lights', 'duration_seconds' => 200, 'track_number' => 9, 'audio_path' => 'songs/blinding-lights.mp3'],
            ['artist' => 'Dua Lipa', 'title' => 'Levitating', 'duration_seconds' => 203, 'track_number' => 3, 'audio_path' => 'songs/levitating.mp3'],
            ['artist' => 'Coldplay', 'title' => 'Viva La Vida', 'duration_seconds' => 242, 'track_number' => 7, 'audio_path' => 'songs/viva-la-vida.mp3'],
            ['artist' => 'BK', 'title' => 'Planos', 'duration_seconds' => 233, 'track_number' => 5, 'audio_path' => 'songs/planos.mp3'],
            ['artist' => 'Taylor Swift', 'title' => 'Anti-Hero', 'duration_seconds' => 200, 'track_number' => 3, 'audio_path' => 'songs/anti-hero.mp3'],
        ];

        foreach ($songs as $songData) {
            $attributes = [
                'duration_seconds' => $songData['duration_seconds'],
                'track_number' => $songData['track_number'],
            ];
            if (isset($songData['audio_path'])) {
                $attributes['audio_path'] = $songData['audio_path'];
            }

            $song = Song::updateOrCreate(
                [
                    'album_id' => $albums[$songData['artist']]->id,
                    'title' => $songData['title'],
                ],
                $attributes
            );

            $playlist->songs()->syncWithoutDetaching([$song->id]);
        }
    }
}
