import { Heart, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export default function Player({ isFavorite, onToggleFavorite }) {
  const {
    audioRef,
    currentSong,
    isPlaying,
    setIsPlaying,
    playbackError,
    setPlaybackError,
    shuffleEnabled,
    setShuffleEnabled,
    repeatMode,
    cycleRepeatMode,
    togglePlay,
    nextSong,
    previousSong,
    handleEnded
  } = usePlayer()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)

  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
  }, [currentSong?.id])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [audioRef, volume])

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (audio) setCurrentTime(audio.currentTime)
  }

  function handleSeek(event) {
    const time = Number(event.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#101010]/95 px-3 py-3 backdrop-blur-xl md:px-6">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
          setIsPlaying(true)
          setPlaybackError('')
        }}
        onError={() => {
          setIsPlaying(false)
          setPlaybackError('Não foi possível carregar o áudio desta música.')
        }}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 md:grid-cols-[minmax(0,1fr)_minmax(18rem,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded bg-zinc-800 sm:block">
            {(currentSong?.album?.cover_image || currentSong?.artwork_url) && (
              <img src={currentSong.album?.cover_image || currentSong.artwork_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentSong?.title || 'Escolha uma música'}</p>
            <p className="truncate text-xs text-zinc-500">{currentSong?.album?.artist?.name || 'FIECFY'}</p>
          </div>
          {currentSong && onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(currentSong)}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:bg-white/10 ${isFavorite ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'}`}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <div className="flex min-w-0 flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShuffleEnabled((enabled) => !enabled)}
              className={`grid h-8 w-8 place-items-center rounded-full ${shuffleEnabled ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'}`}
              aria-label={shuffleEnabled ? 'Desativar aleatório' : 'Ativar aleatório'}
              title="Aleatório"
            >
              <Shuffle size={17} />
            </button>
            <button onClick={previousSong} className="grid h-8 w-8 place-items-center text-zinc-300 hover:text-white" aria-label="Faixa anterior" title="Faixa anterior">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button onClick={togglePlay} disabled={!currentSong?.preview_url && !currentSong?.audio_url} className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-40" aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
              {isPlaying ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}
            </button>
            <button onClick={nextSong} className="grid h-8 w-8 place-items-center text-zinc-300 hover:text-white" aria-label="Próxima faixa" title="Próxima faixa">
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button
              onClick={cycleRepeatMode}
              className={`relative grid h-8 w-8 place-items-center rounded-full ${repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'}`}
              aria-label={`Repetição: ${repeatMode === 'off' ? 'desativada' : repeatMode === 'one' ? 'uma faixa' : 'fila'}`}
              title="Alternar repetição"
            >
              {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>
          </div>
          <div className="flex w-full items-center gap-2 text-[10px] text-zinc-500">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={handleSeek}
              disabled={!duration}
              aria-label="Posição da música"
              className="h-1 min-w-0 flex-1 cursor-pointer accent-[#1ed760] disabled:cursor-default"
            />
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="hidden items-center justify-end gap-2 md:flex">
          {volume === 0
            ? <VolumeX size={18} className="text-zinc-400" />
            : <Volume2 size={18} className="text-zinc-400" />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
            className="h-1 w-24 cursor-pointer accent-[#1ed760]"
          />
        </div>
      </div>
      {playbackError && <p role="status" className="mt-1 text-center text-xs text-amber-400">{playbackError}</p>}
      {currentSong?.preview_url && <p className="mt-1 text-center text-[10px] text-zinc-600">Prévia de até 30 segundos • {currentSong.store_url && <a className="underline hover:text-white" href={currentSong.store_url} target="_blank" rel="noreferrer">Ouvir faixa completa</a>}</p>}
    </footer>
  )
}
