import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminRoles,
  getAdminUsers,
  updateAdminUser,
} from '../services/api.js'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'customer',
  isActive: true,
}

function AdminUsersPage() {
  const { hasPermission } = useAuth()

  const canCreate = hasPermission('users:create')
  const canUpdate = hasPermission('users:update')
  const canDelete = hasPermission('users:delete')

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadData = async () => {
    setLoading(true)
    setFeedback('')
    try {
      const [adminUsers, adminRoles] = await Promise.all([getAdminUsers(), getAdminRoles()])
      setUsers(adminUsers)
      setRoles(adminRoles)
      if (!editingId && adminRoles.length > 0) {
        setForm((current) => ({ ...current, role: adminRoles[0].key }))
      }
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'No se pudieron cargar usuarios y roles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setForm((current) => ({
      ...initialForm,
      role: roles[0]?.key || 'customer',
    }))
    setEditingId('')
  }

  const handleEdit = (user) => {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: Boolean(user.isActive),
    })
    setFeedback('')
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if ((!editingId && !canCreate) || (editingId && !canUpdate)) {
      setFeedback('No tienes permisos para guardar usuarios.')
      return
    }

    setSaving(true)
    setFeedback('')

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
      }

      if (form.password) {
        payload.password = form.password
      }

      if (editingId) {
        await updateAdminUser(editingId, payload)
        setFeedback('Usuario actualizado correctamente.')
      } else {
        if (!payload.password) {
          setFeedback('Password requerida para crear un usuario.')
          setSaving(false)
          return
        }
        await createAdminUser(payload)
        setFeedback('Usuario creado correctamente.')
      }

      resetForm()
      await loadData()
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'No se pudo guardar el usuario.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!canDelete) {
      setFeedback('No tienes permisos para eliminar usuarios.')
      return
    }

    const confirmed = window.confirm('Esta accion eliminara el usuario. Deseas continuar?')
    if (!confirmed) {
      return
    }

    try {
      await deleteAdminUser(userId)
      setFeedback('Usuario eliminado correctamente.')
      await loadData()
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'No se pudo eliminar el usuario.')
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="section-title m-0">Gestion de Usuarios</h1>
          <div className="d-flex gap-2">
            <Link to="/admin" className="btn btn-outline-dark">
              Volver al panel
            </Link>
            <button className="btn btn-dark" onClick={loadData}>
              Refrescar
            </button>
          </div>
        </div>

        {feedback && <p className="small fw-semibold">{feedback}</p>}

        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="floating-card p-4 h-100">
              <h2 className="h4 mb-3">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
                <input
                  required
                  name="name"
                  className="form-control"
                  placeholder="Nombre"
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  required
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Correo"
                  value={form.email}
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder={editingId ? 'Nuevo password (opcional)' : 'Password'}
                  value={form.password}
                  onChange={handleChange}
                  required={!editingId}
                />

                <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                  {roles.map((role) => (
                    <option key={role._id} value={role.key}>
                      {role.name} ({role.key})
                    </option>
                  ))}
                </select>

                <label className="form-check d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <span className="form-check-label">Usuario activo</span>
                </label>

                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-dark"
                    type="submit"
                    disabled={saving || (!editingId && !canCreate) || (editingId && !canUpdate)}
                  >
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear usuario'}
                  </button>
                  <button className="btn btn-outline-dark" type="button" onClick={resetForm}>
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="floating-card p-4 h-100">
              <h2 className="h4 mb-3">Usuarios existentes</h2>

              {loading ? (
                <p>Cargando usuarios...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-muted">
                            No hay usuarios cargados.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className="badge text-bg-secondary">{user.role}</span>
                            </td>
                            <td>
                              <span className={`badge ${user.isActive ? 'text-bg-success' : 'text-bg-danger'}`}>
                                {user.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                {canUpdate && (
                                  <button className="btn btn-sm btn-outline-dark" onClick={() => handleEdit(user)}>
                                    Editar
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminUsersPage
