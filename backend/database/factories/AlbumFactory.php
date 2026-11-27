<?php

namespace Database\Factories;

use App\Models\Artist;
use Illuminate\Database\Eloquent\Factories\Factory;

class AlbumFactory extends Factory
{
    public function definition(): array
    {
        return [
            'artist_id' => Artist::factory(),
            'title' => fake()->words(3, true),
            'release_year' => fake()->numberBetween(1990, 2026),
            'cover_image' => null,
        ];
    }
}
