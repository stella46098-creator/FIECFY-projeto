<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ArtistFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'monthly_listeners' => fake()->numberBetween(1000, 5000000),
        ];
    }
}
