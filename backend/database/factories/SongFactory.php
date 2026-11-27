<?php

namespace Database\Factories;

use App\Models\Album;
use Illuminate\Database\Eloquent\Factories\Factory;

class SongFactory extends Factory
{
    public function definition(): array
    {
        return [
            'album_id' => Album::factory(),
            'title' => fake()->sentence(3),
            'duration_seconds' => fake()->numberBetween(120, 300),
            'track_number' => fake()->numberBetween(1, 15),
            'audio_path' => null,
            'preview_url' => null,
        ];
    }
}
