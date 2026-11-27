<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSongRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'album_id' => ['required', 'exists:albums,id'],
            'title' => ['required', 'string', 'max:255'],
            'duration_seconds' => ['required', 'integer', 'min:1'],
            'track_number' => ['nullable', 'integer', 'min:1'],
            'audio' => ['nullable', 'file', 'mimes:mp3,wav,m4a', 'max:20480'],
            'preview_url' => ['nullable', 'url', 'max:1000'],
        ];
    }
}
