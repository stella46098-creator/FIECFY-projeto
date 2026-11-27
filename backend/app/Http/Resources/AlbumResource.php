<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlbumResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'release_year' => $this->release_year,
            'cover_image' => $this->cover_image ? asset('storage/'.$this->cover_image) : null,
            'artist' => new ArtistResource($this->whenLoaded('artist')),
            'songs' => SongResource::collection($this->whenLoaded('songs')),
        ];
    }
}
