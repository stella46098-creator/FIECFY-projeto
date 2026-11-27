<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MusicPreviewController;
use App\Http\Controllers\ArtistaController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\MusicaController;
use App\Http\Controllers\PlaylistController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/artistas', [ArtistaController::class, 'index']);
Route::get('/artistas/{artista}', [ArtistaController::class, 'show']);
Route::get('/albums', [AlbumController::class, 'index']);
Route::get('/albums/{album}', [AlbumController::class, 'show']);
Route::get('/musicas', [MusicaController::class, 'index']);
Route::get('/musicas/{musica}/preview', [MusicPreviewController::class, 'show']);
Route::get('/musicas/{musica}', [MusicaController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('artistas', ArtistaController::class)
        ->except(['index', 'show']);
    Route::apiResource('musicas', MusicaController::class)
        ->except(['index', 'show']);

    Route::apiResource('playlists', PlaylistController::class);
    Route::post('/playlists/{playlist}/musicas', [PlaylistController::class, 'addSong']);
    Route::delete('/playlists/{playlist}/musicas/{song}', [PlaylistController::class, 'removeSong']);
});

Route::fallback(function () {
    return response()->json([
        'message' => 'Rota não encontrada.',
        'status' => 404,
    ], 404);
});
