<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArtistRequest;
use App\Http\Resources\ArtistResource;
use App\Models\Artist;
use Illuminate\Http\Request;

class ArtistaController extends Controller
{
    public function index(Request $request)
    {
        $artists = Artist::with('albums')
            ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->search.'%'))
            ->orderBy('name')
            ->paginate(15);

        return ArtistResource::collection($artists);
    }

    public function store(StoreArtistRequest $request)
    {
        $artist = Artist::create($request->validated());
        return new ArtistResource($artist);
    }

    public function show(Artist $artista)
    {
        $artista->load('albums.songs');
        return new ArtistResource($artista);
    }

    public function update(StoreArtistRequest $request, Artist $artista)
    {
        $artista->update($request->validated());
        return new ArtistResource($artista);
    }

    public function destroy(Artist $artista)
    {
        $artista->delete();
        return response()->json(['message' => 'Artista excluído com sucesso.']);
    }
}
