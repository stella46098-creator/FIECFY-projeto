<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Song;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MusicPreviewController extends Controller
{
    public function show(Song $musica)
    {
        if ($musica->preview_url) {
            return response()->json([
                'preview_url' => $musica->preview_url,
                'artwork_url' => null,
                'store_url' => null,
            ]);
        }

        try {
            $preview = Cache::remember('itunes-preview-'.$musica->id, now()->addHours(12), function () use ($musica) {
                $musica->loadMissing('album.artist');
                $artistName = $musica->album?->artist?->name ?? 'Billie Eilish';

                $response = Http::timeout(10)->get('https://itunes.apple.com/search', [
                    'term' => $musica->title.' '.$artistName,
                    'entity' => 'song',
                    'limit' => 8,
                    'country' => 'BR',
                ]);

                $response->throw();
                $results = $response->json('results', []);

                $matchesArtist = fn ($item) => str_contains(
                    strtolower($item['artistName'] ?? ''),
                    strtolower($artistName)
                );

                $match = collect($results)->first(function ($item) use ($musica, $matchesArtist) {
                    return strcasecmp(trim($item['trackName'] ?? ''), trim($musica->title)) === 0
                        && $matchesArtist($item);
                }) ?? collect($results)->first(function ($item) use ($musica, $matchesArtist) {
                    $trackName = strtolower(trim($item['trackName'] ?? ''));
                    $title = strtolower(trim($musica->title));

                    return str_starts_with($trackName, $title.' (') && $matchesArtist($item);
                });

                if (!$match) return null;

                return [
                    'preview_url' => $match['previewUrl'] ?? null,
                    'artwork_url' => isset($match['artworkUrl100'])
                        ? str_replace('100x100bb', '600x600bb', $match['artworkUrl100'])
                        : null,
                    'store_url' => $match['trackViewUrl'] ?? null,
                ];
            });

            return response()->json($preview ?? [
                'preview_url' => null,
                'artwork_url' => null,
                'store_url' => null,
                'message' => 'Prévia não encontrada para esta faixa.',
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Não foi possível consultar a prévia musical neste momento.',
            ], 502);
        }
    }
}
