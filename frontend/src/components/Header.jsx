import { LogOut, Music2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur md:px-8">
      <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1ed760] text-black"><Music2 size={21} /></span>
        FIEC<span className="text-[#1ed760]">fy</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-zinc-300 sm:inline">Olá, {user?.name || 'ouvinte'}</span>
        <button onClick={async () => { await logout(); navigate("/login", { replace: true }) }} className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white">
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  )
}
