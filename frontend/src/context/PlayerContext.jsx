
import { createContext, useContext, useRef, useState } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [shuffleEnabled, setShuffleEnabled] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off')

  function startSong(song) {
    const source = song.preview_url || song.audio_url
    const audio = audioRef.current
    setCurrentSong(song)
    setPlaybackError('')

    if (!source) {
      audio?.pause()
      setIsPlaying(false)
      setPlaybackError(song.preview_unavailable
        ? 'A prévia desta música não está disponível no momento.'
        : 'Esta música ainda não tem áudio cadastrado.')
      return
    }

    if (!audio) {
      setIsPlaying(false)
      setPlaybackError('O player de áudio não está disponível.')
      return
    }

    audio.pause()
    audio.src = source
    audio.currentTime = 0
    audio.load()
    audio.play().catch(() => {
      setIsPlaying(false)
      setPlaybackError('Não foi possível reproduzir esta prévia. Tente novamente.')
    })
  }

  function playSong(song, songs = [song]) {
    let nextQueue = songs.length ? songs : [song]
    let songIndex = nextQueue.findIndex((item) => item.id === song.id)

    if (songIndex === -1) {
      nextQueue = [...nextQueue, song]
      songIndex = nextQueue.length - 1
    }

    setQueue(nextQueue)
    setCurrentIndex(songIndex)
    startSong(song)
  }

  function playAtIndex(index) {
    const song = queue[index]
    if (!song) return

    setCurrentIndex(index)
    startSong(song)
  }

  function nextSong() {
    if (!queue.length || currentIndex < 0) return

    if (shuffleEnabled && queue.length > 1) {
      const options = queue.map((_, index) => index).filter((index) => index !== currentIndex)
      playAtIndex(options[Math.floor(Math.random() * options.length)])
      return
    }

    if (currentIndex < queue.length - 1) {
      playAtIndex(currentIndex + 1)
    } else if (repeatMode === 'all') {
      playAtIndex(0)
    } else {
      audioRef.current?.pause()
      setIsPlaying(false)
    }
  }

  function previousSong() {
    const audio = audioRef.current
    if (!queue.length || currentIndex < 0) return

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }

    if (currentIndex > 0) {
      playAtIndex(currentIndex - 1)
    } else if (repeatMode === 'all') {
      playAtIndex(queue.length - 1)
    } else {
      playAtIndex(0)
    }
  }

  function handleEnded() {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        setIsPlaying(false)
        setPlaybackError('Não foi possível reproduzir esta prévia. Tente novamente.')
      })
      return
    }

    nextSong()
  }

  function togglePlay() {
    const audio = audioRef.current

    if (!audio || !currentSong) return

    if (audio.paused) {
      setPlaybackError('')
      audio.play()
        .catch(() => {
          setIsPlaying(false)
          setPlaybackError('Não foi possível reproduzir esta prévia. Tente novamente.')
        })
    } else {
      audio.pause()
    }
  }

  const value = {
    audioRef,
    currentSong,
    isPlaying,
    setIsPlaying,
    playbackError,
    setPlaybackError,
    queue,
    currentIndex,
    shuffleEnabled,
    repeatMode,
    setShuffleEnabled,
    cycleRepeatMode: () => setRepeatMode((mode) => (
      mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off'
    )),
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    handleEnded
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
