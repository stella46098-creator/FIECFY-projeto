<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArtistaController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\MusicaController;
use App\Support\FaixaMusical;

// Criando um endoint para o Objeto
Route::get('/minha-musica', function() {
    // Instanciando o objeto
    $musica1 = new FaixaMusical('Bohemian Rhapsody', 'Queen');
    $musica2 = new FaixaMusical('Ocean Eyes', 'Billie Eilish');
    $musica3= new FaixaMusical('Purple Rain', 'Princce');

    return response()->json([$musica1,$musica2, $musica3]);
});

Route::get('/', function () {
    return view('welcome');
});

Route::get('/teste', function() {

return [
    'sistema' => 'API Clone do Spotify',
    'versao' => '1.0',
    'status' => 'Conectado'
];

});

Route::get('/artistas' , [ArtistaController::class, 'index']);
Route::get('/artistas/{id}' , [ArtistaController::class, 'show']);
Route::get('albuns' , [AlbumController::class, 'index']);
Route::get('/albuns/{id}' , [AlbumController::class, 'show']);

Route::get('/musicas' , [MusicaController::class, 'index']);