
import { useEffect, useMemo, useState } from 'react'
import { Play, Plus, Search, Music2, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import SongCard from '../components/SongCard'
import Skeleton from '../components/Skeleton'
import Player from '../components/Player'
import { usePlayer } from '../context/PlayerContext'

const featuredTracks = [
  { title: 'Ocean Eyes', artist: 'Billie Eilish' },
  { title: 'Blinding Lights', artist: 'The Weeknd' },
  { title: 'Levitating', artist: 'Dua Lipa' },
  { title: 'Viva La Vida', artist: 'Coldplay' },
  { title: 'Planos', artist: 'BK' },
  { title: 'Anti-Hero', artist: 'Taylor Swift' },
]

async function addApplePreview(song) {
  if (song.preview_url || song.audio_url) return song

  try {
    const response = await api.get(`/musicas/${song.id}/preview`)
    return {
      ...song,
      ...response.data,
      preview_unavailable: !response.data.preview_url,
    }
  } catch {
    return { ...song, preview_unavailable: true }
  }
}

export default function Home() {
  const [songs, setSongs] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { currentSong, playSong } = usePlayer()

  useEffect(() => {
    async function loadLibrary() {
      try {
        setLoading(true)
        
        setError(false)

        const [trackResponses, playlistResponse] = await Promise.all([
          Promise.all(featuredTracks.map(({ title, artist }) =>
            api.get('/musicas', { params: { search: title, artist } })
          )),
          api.get('/playlists'),
        ])

        const songList = [...new Map(
          trackResponses.flatMap((response) => response.data.data || [])
            .map((song) => [song.id, song])
        ).values()]
        const playlistList = playlistResponse.data.data || []

        const enrichedSongs = await Promise.all(
          songList.map(addApplePreview)
        )

        setSongs(enrichedSongs)
        setPlaylists(playlistList)
        setSelectedPlaylistId(playlistList[0] ? String(playlistList[0].id) : '')
      } catch (requestError) {
        setError(true)
        toast.error('Não foi possível carregar a biblioteca.')
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [])

  const filteredSongs = useMemo(() => {
    return songs.filter((song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.album?.artist?.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [songs, search])

  const selectedPlaylist = playlists.find(
    (playlist) => String(playlist.id) === selectedPlaylistId
  )
  const favoritesPlaylist = playlists.find(
    (playlist) => playlist.name.toLowerCase() === 'favoritas'
  )
  const currentSongIsFavorite = currentSong ? isFavorite(currentSong.id) : false

  function isFavorite(songId) {
    return favoritesPlaylist?.songs?.some((song) => song.id === songId) || false
  }

  async function createPlaylist(event) {
    event.preventDefault()
    const name = playlistName.trim()
    if (!name) return

    try {
      const response = await api.post('/playlists', { name })
      const playlist = { ...response.data.data, songs: [] }
      setPlaylists((current) => [...current, playlist])
      setSelectedPlaylistId(String(playlist.id))
      setPlaylistName('')
      toast.success('Playlist criada com sucesso!')
    } catch {
      toast.error('Não foi possível criar a playlist.')
    }
  }

  async function addSongToPlaylist(song) {
    if (!selectedPlaylistId) {
      toast.info('Crie ou selecione uma playlist primeiro.')
      return
    }

    try {
      await api.post(`/playlists/${selectedPlaylistId}/musicas`, { song_id: song.id })
      setPlaylists((current) => current.map((playlist) => (
        String(playlist.id) === selectedPlaylistId
          ? {
              ...playlist,
              songs: playlist.songs?.some((item) => item.id === song.id)
                ? playlist.songs
                : [...(playlist.songs || []), song],
            }
          : playlist
      )))
      toast.success(`"${song.title}" adicionada à playlist.`)
    } catch {
      toast.error('Não foi possível adicionar a música à playlist.')
    }
  }

  async function toggleFavorite(song) {
    let playlist = favoritesPlaylist

    try {
      if (!playlist) {
        const response = await api.post('/playlists', { name: 'Favoritas' })
        playlist = { ...response.data.data, songs: [] }
        setPlaylists((current) => [...current, playlist])
      }

      const alreadyFavorite = playlist.songs?.some((item) => item.id === song.id)

      if (alreadyFavorite) {
        await api.delete(`/playlists/${playlist.id}/musicas/${song.id}`)
        setPlaylists((current) => current.map((item) => (
          item.id === playlist.id
            ? { ...item, songs: item.songs.filter((favorite) => favorite.id !== song.id) }
            : item
        )))
        toast.info(`"${song.title}" removida dos favoritos.`)
      } else {
        await api.post(`/playlists/${playlist.id}/musicas`, { song_id: song.id })
        setPlaylists((current) => current.map((item) => (
          item.id === playlist.id
            ? { ...item, songs: [...(item.songs || []), song] }
            : item
        )))
        toast.success(`"${song.title}" adicionada aos favoritos.`)
      }
    } catch {
      toast.error('Não foi possível atualizar os favoritos.')
    }
  }

  async function getPlaylistQueue(playlist) {
    return Promise.all((playlist.songs || []).map((playlistSong) => (
      songs.find((song) => song.id === playlistSong.id) || addApplePreview(playlistSong)
    )))
  }

  async function playPlaylist(playlist) {
    const queue = await getPlaylistQueue(playlist)
    if (!queue.length) {
      toast.info('Esta playlist ainda não tem músicas.')
      return
    }

    playSong(queue[0], queue)
  }

  async function playPlaylistSong(playlist, playlistSong) {
    const queue = await getPlaylistQueue(playlist)
    const song = queue.find((item) => item.id === playlistSong.id)
    if (song) playSong(song, queue)
  }

  async function removeSongFromPlaylist(playlist, song) {
    try {
      await api.delete(`/playlists/${playlist.id}/musicas/${song.id}`)
      setPlaylists((current) => current.map((item) => (
        item.id === playlist.id
          ? { ...item, songs: item.songs.filter((playlistSong) => playlistSong.id !== song.id) }
          : item
      )))
      toast.success(`"${song.title}" removida da playlist.`)
    } catch {
      toast.error('Não foi possível remover a música da playlist.')
    }
  }

  return (
    <div className="min-h-screen bg-[#090909] pb-36 text-white">
      <Header />

      <div className="mx-auto flex max-w-7xl gap-5 px-3 py-5 md:px-6">
        <Sidebar />

        <main className="min-w-0 flex-1 rounded-xl bg-gradient-to-b from-[#173d2b] via-[#151515] to-[#121212] p-5 md:p-8">

          <section id="inicio" className="mb-9">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-[#1ed760]">
              Seu som começa aqui
            </p>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Boa música, bons momentos.
            </h1>

            <p className="mt-3 max-w-xl text-sm text-zinc-300 md:text-base">
              Ouça suas músicas favoritas e descubra novos artistas.
            </p>
          </section>

          <section id="musicas" className="mb-10">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold">Músicas</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Faixas selecionadas de artistas reais
                </p>
              </div>

              <label className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2">
                <Search size={17} className="text-zinc-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar música ou artista..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500 sm:w-48"
                />
              </label>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label htmlFor="song-playlist" className="text-sm text-zinc-400">
                Adicionar à playlist
              </label>
              <select
                id="song-playlist"
                value={selectedPlaylistId}
                onChange={(event) => setSelectedPlaylistId(event.target.value)}
                className="rounded-full border border-white/15 bg-[#202020] px-4 py-2 text-sm text-white outline-none focus:border-[#1ed760]"
              >
                {playlists.length === 0 && <option value="">Nenhuma playlist</option>}
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                ))}
              </select>
              {playlists.length === 0 && (
                <span className="text-sm text-zinc-500">Crie uma playlist abaixo para adicionar músicas.</span>
              )}
            </div>

            {loading ? (
              <Skeleton />
            ) : error ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center">
                <Music2 className="mx-auto mb-2 text-zinc-500" size={30} />
                <p className="font-semibold">A biblioteca está indisponível.</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Verifique se a API está ligada.
                </p>
              </div>
            ) : filteredSongs.length ? (
              <div className="grid gap-2 lg:grid-cols-2">
                {filteredSongs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index}
                    isFavorite={isFavorite(song.id)}
                    onToggleFavorite={toggleFavorite}
                    onPlaySong={(selectedSong) => playSong(selectedSong, songs)}
                    onAddToPlaylist={addSongToPlaylist}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-black/20 p-5 text-sm text-zinc-400">
                Nenhuma música encontrada.
              </p>
            )}
          </section>

          <section id="playlists" className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold">Suas playlists</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Crie listas e organize suas músicas favoritas.
                </p>
              </div>
            </div>

            <form onSubmit={createPlaylist} className="mt-4 flex flex-wrap gap-2">
              <input
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                placeholder="Nome da nova playlist"
                maxLength={100}
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-[#1ed760]"
              />
              <button
                type="submit"
                disabled={!playlistName.trim()}
                className="flex items-center justify-center gap-2 rounded-full bg-[#1ed760] px-5 py-2 text-sm font-bold text-black transition hover:bg-[#53e886] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />
                Criar playlist
              </button>
            </form>

            {playlists.length > 0 && (
              <>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => setSelectedPlaylistId(String(playlist.id))}
                      className={`rounded-lg border p-3 text-left transition ${selectedPlaylistId === String(playlist.id) ? 'border-[#1ed760]/60 bg-[#1ed760]/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
                    >
                      <p className="truncate font-semibold">{playlist.name}</p>
                      <p className="mt-1 text-xs text-zinc-400">{playlist.songs?.length || 0} músicas</p>
                    </button>
                  ))}
                </div>

                {selectedPlaylist && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{selectedPlaylist.name}</h3>
                      <button
                        onClick={() => playPlaylist(selectedPlaylist)}
                        disabled={!selectedPlaylist.songs?.length}
                        className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Play size={14} fill="currentColor" />
                        Reproduzir
                      </button>
                    </div>
                    {selectedPlaylist.songs?.length ? (
                      <div className="space-y-1">
                        {selectedPlaylist.songs.map((playlistSong) => {
                          const song = songs.find((item) => item.id === playlistSong.id) || playlistSong

                          return (
                            <div key={song.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.05]">
                              <button
                                onClick={() => playPlaylistSong(selectedPlaylist, playlistSong)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className="block truncate text-sm font-medium">{song.title}</span>
                                <span className="block truncate text-xs text-zinc-500">{song.album?.artist?.name || 'Artista'}</span>
                              </button>
                              <button
                                onClick={() => removeSongFromPlaylist(selectedPlaylist, song)}
                                aria-label={`Remover ${song.title} da playlist`}
                                title="Remover da playlist"
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-white/10 hover:text-white"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">Adicione músicas usando o botão + na biblioteca.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

        </main>
      </div>

      <Player
        isFavorite={currentSongIsFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}
