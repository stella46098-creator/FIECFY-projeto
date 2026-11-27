<?php

namespace App\Support;

class FaixaMusical
{
    public string $titulo;
    public string $artista;

    public function __construct(string $tituloDesejado, string $artistaDesejado)
    {
        $this->titulo = $tituloDesejado;
        $this->artista = $artistaDesejado;
    }

    public function getDetalhes(): string
    {
        return $this->titulo.' - '.$this->artista;
    }
}
