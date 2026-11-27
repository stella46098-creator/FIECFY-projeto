<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaylistRequest;
use App\Http\Resources\PlaylistResource;
use App\Models\Playlist;
use App\Models\Song;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function index(Request $request)
    {
        $playlists = Playlist::with('songs.album.artist')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return PlaylistResource::collection($playlists);
    }

    public function store(StorePlaylistRequest $request)
    {
        $playlist = Playlist::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
        ]);

        return new PlaylistResource($playlist);
    }

    public function show(Request $request, Playlist $playlist)
    {
        abort_unless($playlist->user_id === $request->user()->id, 403);
        return new PlaylistResource($playlist->load('songs.album.artist'));
    }

    public function update(StorePlaylistRequest $request, Playlist $playlist)
    {
        abort_unless($playlist->user_id === $request->user()->id, 403);
        $playlist->update($request->validated());
        return new PlaylistResource($playlist);
    }

    public function destroy(Request $request, Playlist $playlist)
    {
        abort_unless($playlist->user_id === $request->user()->id, 403);
        $playlist->delete();

        return response()->json(['message' => 'Playlist movida para a lixeira.']);
    }

    public function addSong(Request $request, Playlist $playlist)
    {
        abort_unless($playlist->user_id === $request->user()->id, 403);
        $data = $request->validate(['song_id' => ['required', 'exists:songs,id']]);
        $playlist->songs()->syncWithoutDetaching([$data['song_id']]);

        return new PlaylistResource($playlist->load('songs.album.artist'));
    }

    public function removeSong(Request $request, Playlist $playlist, Song $song)
    {
        abort_unless($playlist->user_id === $request->user()->id, 403);
        $playlist->songs()->detach($song->id);

        return response()->json(['message' => 'Música removida da playlist.']);
    }
}
