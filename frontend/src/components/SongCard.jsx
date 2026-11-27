import { usePlayer } from '../context/PlayerContext'
import PlayButton from './PlayButton'
import { Heart, Plus } from 'lucide-react'

export default function SongCard({ song, index, isFavorite, onToggleFavorite, onAddToPlaylist, onPlaySong }) {
  const { playSong } = usePlayer()
  const artwork = song.album?.cover_image || song.artwork_url
  const play = () => (onPlaySong || playSong)(song)

  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-lg bg-white/[0.04] p-3 transition hover:bg-white/[0.09]">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-[#1ed760] to-[#183c28]">
        {artwork && <img src={artwork} alt={`Capa de ${song.title}`} className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <button onClick={play} className="block max-w-full truncate text-left font-semibold text-white hover:underline">{song.title}</button>
        <p className="truncate text-sm text-zinc-400">{song.album?.artist?.name || 'Artista desconhecido'}</p>
      </div>
      <span className="hidden text-xs text-zinc-500 sm:inline">{song.duration_formatted || '—:—'}</span>
      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(song)}
          aria-label={isFavorite ? `Remover ${song.title} dos favoritos` : `Adicionar ${song.title} aos favoritos`}
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10 ${isFavorite ? 'text-[#1ed760]' : 'text-zinc-400 hover:text-white'}`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
      {onAddToPlaylist && (
        <button
          onClick={() => onAddToPlaylist(song)}
          aria-label={`Adicionar ${song.title} à playlist`}
          title="Adicionar à playlist"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <Plus size={18} />
        </button>
      )}
      <PlayButton onClick={play} label={`Reproduzir ${song.title}`} />
      <span className="sr-only">Faixa {index + 1}</span>
    </div>
  )
}
