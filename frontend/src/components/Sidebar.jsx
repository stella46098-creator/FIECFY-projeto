import { Home, ListMusic, Search } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-5 rounded-xl bg-[#121212] p-5 md:flex">
      <nav className="space-y-4 text-sm font-semibold text-zinc-400">
        <a href="#inicio" className="flex items-center gap-3 text-white hover:text-[#1ed760]"><Home size={19}/> Início</a>
        <a href="#musicas" className="flex items-center gap-3 hover:text-white"><Search size={19}/> Buscar músicas</a>
        <a href="#playlists" className="flex items-center gap-3 hover:text-white"><ListMusic size={19}/> Playlists</a>
      </nav>
      <div className="mt-3 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-500">
        Sua biblioteca musical no FIECFY.
      </div>
    </aside>
  )
}
