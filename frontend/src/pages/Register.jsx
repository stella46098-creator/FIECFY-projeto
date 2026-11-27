import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('As senhas não coincidem.')
      return
    }
    try {
      setLoading(true)
      await register(form)
      toast.success('Conta criada! Boas-vindas ao FIECFY.')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Não foi possível realizar o cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,#17452c_0%,#101010_45%,#080808_100%)] px-4 py-10 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-7 shadow-2xl sm:p-10">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#1ed760] text-black"><Music2 size={26}/></div>
          <h1 className="text-3xl font-black">Criar conta</h1>
          <p className="mt-2 text-sm text-zinc-400">Faça parte do FIECFY.</p>
        </div>
        {[
          ['name', 'Nome', 'text'],
          ['email', 'E-mail', 'email'],
          ['password', 'Senha (mínimo 8 caracteres)', 'password'],
          ['password_confirmation', 'Confirme a senha', 'password'],
        ].map(([name, label, type]) => (
          <label key={name} className="mb-4 block text-sm font-semibold">
            {label}
            <input name={name} type={type} required minLength={name.includes('password') ? 8 : undefined} value={form[name]} onChange={update} className="mt-2 w-full rounded-lg border border-zinc-700 bg-[#202020] px-4 py-3 font-normal outline-none focus:border-[#1ed760]"/>
          </label>
        ))}
        <button disabled={loading} className="mt-2 w-full rounded-full bg-[#1ed760] py-3 font-bold text-black transition hover:bg-[#55e889] disabled:opacity-50">{loading ? 'Criando...' : 'Criar conta'}</button>
        <p className="mt-6 text-center text-sm text-zinc-400">Já tem conta? <Link to="/login" className="font-semibold text-white underline hover:text-[#1ed760]">Entrar</Link></p>
      </form>
    </main>
  )
}
