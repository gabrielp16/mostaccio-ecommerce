import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    closeSnackbar()
    setSubmitting(true)

    try {
      const user = await login(form)
      if (user.role === 'admin') {
        navigate('/admin')
        return
      }
      navigate('/')
    } catch {
      showSnackbar('No se pudo iniciar sesion. Verifica tus credenciales.', { variant: 'error' })
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

          <Snackbar
            open={snackbar.open}
            mode="toast"
            title={snackbar.title}
            variant={snackbar.variant}
            message={snackbar.message}
            autoHideDuration={snackbar.autoHideDuration}
            onClose={closeSnackbar}
          />

          <div className="small text-muted mt-3 mb-0">
            <p className="mb-1">Administrador: admin@motaccio.local / admin12345</p>
            <p className="mb-1">Empleado: empleado@motaccio.local / empleado12345</p>
            <p className="mb-1">Contador: contador@motaccio.local / contador12345</p>
            <p className="mb-0">Supervisor: supervisor@motaccio.local / supervisor12345</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
