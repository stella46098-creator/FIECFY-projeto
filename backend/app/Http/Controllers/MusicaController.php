<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSongRequest;
use App\Http\Resources\SongResource;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MusicaController extends Controller
{
    public function index(Request $request)
    {
        $songs = Song::with(['album.artist'])
            ->when($request->filled('search'), fn ($query) => $query->where('title', 'like', '%'.$request->search.'%'))
            ->when($request->filled('artist'), fn ($query) => $query->whereHas('album.artist', fn ($artist) => $artist->where('name', 'like', '%'.$request->artist.'%')))
            ->orderBy('title')
            ->paginate(15);

        return SongResource::collection($songs);
    }

    public function store(StoreSongRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('audio')) {
            $data['audio_path'] = $request->file('audio')->store('songs', 'public');
        }
        unset($data['audio']);

        return new SongResource(Song::create($data)->load('album.artist'));
    }

    public function show(Song $musica)
    {
        return new SongResource($musica->load('album.artist'));
    }

    public function update(StoreSongRequest $request, Song $musica)
    {
        $data = $request->validated();
        if ($request->hasFile('audio')) {
            if ($musica->audio_path) Storage::disk('public')->delete($musica->audio_path);
            $data['audio_path'] = $request->file('audio')->store('songs', 'public');
        }
        unset($data['audio']);

        $musica->update($data);
        return new SongResource($musica->load('album.artist'));
    }

    public function destroy(Song $musica)
    {
        $musica->delete();
        return response()->json(['message' => 'Música excluída com sucesso.']);
    }
}
