import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setLoading(true)
      await login(email, password)
      toast.success('Login realizado com sucesso!')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível entrar. Confira seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,#17452c_0%,#101010_45%,#080808_100%)] px-4 py-10 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-7 shadow-2xl sm:p-10">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#1ed760] text-black"><Music2 size={26}/></div>
          <h1 className="text-3xl font-black">FIEC<span className="text-[#1ed760]">fy</span></h1>
          <p className="mt-2 text-sm text-zinc-400">Entre para ouvir suas músicas favoritas.</p>
        </div>
        <label className="mb-2 block text-sm font-semibold">E-mail</label>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mb-5 w-full rounded-lg border border-zinc-700 bg-[#202020] px-4 py-3 outline-none focus:border-[#1ed760]" placeholder="seuemail@exemplo.com"/>
        <label className="mb-2 block text-sm font-semibold">Senha</label>
        <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mb-6 w-full rounded-lg border border-zinc-700 bg-[#202020] px-4 py-3 outline-none focus:border-[#1ed760]" placeholder="Sua senha"/>
        <button disabled={loading} className="w-full rounded-full bg-[#1ed760] py-3 font-bold text-black transition hover:bg-[#55e889] disabled:opacity-50">{loading ? 'Entrando...' : 'Entrar'}</button>
        <p className="mt-6 text-center text-sm text-zinc-400">Ainda não tem conta? <Link to="/register" className="font-semibold text-white underline hover:text-[#1ed760]">Cadastre-se</Link></p>
        <p className="mt-5 text-center text-xs text-zinc-600">Projeto acadêmico • FIEC</p>
      </form>
    </main>
  )
}
