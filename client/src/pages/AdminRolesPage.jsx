import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRoles,
  updateAdminRole,
} from '../services/api.js'

const PERMISSION_OPTIONS = [
  'products:read',
  'products:create',
  'products:update',
  'products:delete',
  'orders:read',
  'orders:update',
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
]

const initialForm = {
  key: '',
  name: '',
  permissions: [],
}

function AdminRolesPage() {
  const { hasPermission } = useAuth()

  const canCreate = hasPermission('roles:create')
  const canUpdate = hasPermission('roles:update')
  const canDelete = hasPermission('roles:delete')

  const [roles, setRoles] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [editingIsSystem, setEditingIsSystem] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadRoles = async () => {
    setLoading(true)
    setFeedback('')
    try {
      const adminRoles = await getAdminRoles()
      setRoles(adminRoles)
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'No se pudieron cargar los roles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId('')
    setEditingIsSystem(false)
  }

  const togglePermission = (permission) => {
    setForm((current) => {
      const exists = current.permissions.includes(permission)
      return {
        ...current,
        permissions: exists
          ? current.permissions.filter((item) => item !== permission)
          : [...current.permissions, permission],
      }
    })
  }

  const handleEdit = (role) => {
    setEditingId(role._id)
    setEditingIsSystem(Boolean(role.isSystem))
    setForm({
      key: role.key,
      name: role.name,
      permissions: role.permissions || [],
    })
    setFeedback('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if ((!editingId && !canCreate) || (editingId && !canUpdate)) {
      setFeedback('No tienes permisos para guardar roles.')
      return
    }

    setSaving(true)
    setFeedback('')

    try {
      if (editingId) {
        await updateAdminRole(editingId, {
          name: form.name,
          permissions: form.permissions,
        })
        setFeedback('Rol actualizado correctamente.')
      } else {
        await createAdminRole({
          key: form.key,
          name: form.name,
          permissions: form.permissions,
        })
        setFeedback('Rol creado correctamente.')
      }

      resetForm()
      await loadRoles()
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'No se pudo guardar el rol.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role) => {
    if (!canDelete) {
      setFeedback('No tienes permisos para eliminar roles.')
      return
    }

    if (role.isSystem) {
      setFeedback('Los roles del sistema no se pueden eliminar.')
      return
    }

    const confirmed = window.confirm('Esta accion eliminara el rol. Deseas continuar?')
    if (!confirmed) {
      return
    }

    try {
      await deleteAdminRole(role._id)
      setFeedback('Rol eliminado correctamente.')
      await loadRoles()
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'No se pudo eliminar el rol.')
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="section-title m-0">Gestion de Roles y Permisos</h1>
          <div className="d-flex gap-2">
            <Link to="/admin" className="btn btn-outline-dark">
              Volver al panel
            </Link>
            <button className="btn btn-dark" onClick={loadRoles}>
              Refrescar
            </button>
          </div>
        </div>

        {feedback && <p className="small fw-semibold">{feedback}</p>}

        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="floating-card p-4 h-100">
              <h2 className="h4 mb-3">{editingId ? 'Editar rol' : 'Nuevo rol'}</h2>
              <form className="d-flex flex-column gap-2" onSubmit={handleSubmit}>
                <input
                  required
                  name="key"
                  className="form-control"
                  placeholder="Clave (ej: marketing_manager)"
                  value={form.key}
                  onChange={handleChange}
                  disabled={Boolean(editingId)}
                />
                <input
                  required
                  name="name"
                  className="form-control"
                  placeholder="Nombre descriptivo"
                  value={form.name}
                  onChange={handleChange}
                />

                <div className="border rounded-3 p-3" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  <p className="small fw-semibold mb-2">Permisos</p>
                  <div className="d-flex flex-column gap-2">
                    {PERMISSION_OPTIONS.map((permission) => (
                      <label key={permission} className="form-check d-flex align-items-center gap-2 mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                        />
                        <span className="form-check-label">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {editingIsSystem && (
                  <p className="small text-muted mb-0">
                    Este es un rol del sistema. Puedes modificar permisos, pero no eliminarlo.
                  </p>
                )}

                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-dark"
                    type="submit"
                    disabled={saving || (!editingId && !canCreate) || (editingId && !canUpdate)}
                  >
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear rol'}
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
              <h2 className="h4 mb-3">Roles existentes</h2>

              {loading ? (
                <p>Cargando roles...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Rol</th>
                        <th>Clave</th>
                        <th>Permisos</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-muted">
                            No hay roles cargados.
                          </td>
                        </tr>
                      ) : (
                        roles.map((role) => (
                          <tr key={role._id}>
                            <td>
                              {role.name}
                              {role.isSystem && <span className="badge text-bg-secondary">Sistema</span>}
                            </td>
                            <td>{role.key}</td>
                            <td style={{ minWidth: '220px' }}>
                              <div className="d-flex flex-wrap gap-1">
                                {(role.permissions || []).length === 0 ? (
                                  <span className="text-muted small">Sin permisos</span>
                                ) : (
                                  role.permissions.map((permission) => (
                                    <span key={`${role._id}-${permission}`} className="badge text-bg-light border">
                                      {permission}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                {canUpdate && (
                                  <button className="btn btn-sm btn-outline-dark" onClick={() => handleEdit(role)}>
                                    Editar
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(role)}
                                    disabled={role.isSystem}
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

export default AdminRolesPage
