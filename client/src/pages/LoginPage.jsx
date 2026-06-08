import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback('')
    setSubmitting(true)

    try {
      const user = await login(form)
      if (user.role === 'admin') {
        navigate('/admin')
        return
      }
      navigate('/')
    } catch {
      setFeedback('No se pudo iniciar sesion. Verifica tus credenciales.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="floating-card p-4 p-md-5">
          <p className="hero-kicker mb-2">Acceso</p>
          <h1 className="section-title mb-4">Login</h1>

          <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
            <input
              required
              name="email"
              type="email"
              className="form-control form-control-lg"
              placeholder="Correo"
              value={form.email}
              onChange={handleChange}
            />
            <input
              required
              name="password"
              type="password"
              className="form-control form-control-lg"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <button className="btn btn-dark btn-lg" disabled={submitting}>
              {submitting ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          {feedback && <p className="small fw-semibold mt-3 mb-0">{feedback}</p>}

          <p className="small text-muted mt-3 mb-0">
            Admin demo: admin@motaccio.local / admin12345
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
