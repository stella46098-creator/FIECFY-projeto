<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    use HasFactory;

    protected $fillable = [
        'album_id', 'title', 'duration_seconds', 'track_number',
        'audio_path', 'preview_url'
    ];

    protected $appends = ['duration_formatted'];

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function playlists()
    {
        return $this->belongsToMany(Playlist::class);
    }

    public function getDurationFormattedAttribute(): string
    {
        $seconds = (int) $this->duration_seconds;
        return sprintf('%02d:%02d', intdiv($seconds, 60), $seconds % 60);
    }
}
