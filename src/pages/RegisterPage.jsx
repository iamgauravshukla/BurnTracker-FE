import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { registerUser } from '../services/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await registerUser(formData)
      navigate('/login', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Create your account to access the workspace using the same clean sign-in experience."
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Sign in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email address</span>
          <input
            autoComplete="email"
            className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
            name="email"
            onChange={handleChange}
            placeholder="founder@burntracker.app"
            required
            type="email"
            value={formData.email}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
            name="password"
            onChange={handleChange}
            placeholder="Create a password"
            required
            type="password"
            value={formData.password}
          />
        </label>

        <button
          className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </AuthLayout>
  )
}