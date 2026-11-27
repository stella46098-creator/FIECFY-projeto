<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SongResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'duration_seconds' => $this->duration_seconds,
            'duration_formatted' => $this->duration_formatted,
            'track_number' => $this->track_number,
            'audio_url' => $this->audio_path ? asset('storage/'.$this->audio_path) : null,
            'preview_url' => $this->preview_url,
            'album' => new AlbumResource($this->whenLoaded('album')),
        ];
    }
}
