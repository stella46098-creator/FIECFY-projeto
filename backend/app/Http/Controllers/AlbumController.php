<?php

namespace App\Http\Controllers;

use App\Http\Resources\AlbumResource;
use App\Models\Album;
use Illuminate\Http\Request;

class AlbumController extends Controller
{
    public function index(Request $request)
    {
        $albums = Album::with(['artist', 'songs'])
            ->when($request->filled('search'), fn ($query) => $query->where('title', 'like', '%'.$request->search.'%'))
            ->when($request->filled('artist'), fn ($query) => $query->whereHas('artist', fn ($artist) => $artist->where('name', 'like', '%'.$request->artist.'%')))
            ->orderByDesc('release_year')
            ->paginate(15);

        return AlbumResource::collection($albums);
    }

    public function show(Album $album)
    {
        $album->load(['artist', 'songs']);
        return new AlbumResource($album);
    }
}
