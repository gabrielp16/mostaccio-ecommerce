import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import AdminLayout from '../components/AdminLayout.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminRoles,
  getAdminUsers,
  updateAdminUser,
} from '../services/api.js'

const initialUserForm = {
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
  const [createForm, setCreateForm] = useState(initialUserForm)
  const [editForm, setEditForm] = useState(initialUserForm)
  const [editingId, setEditingId] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingCreate, setSavingCreate] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteCandidateId, setDeleteCandidateId] = useState('')
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const getDefaultUserForm = () => ({
    ...initialUserForm,
    role: roles[0]?.key || 'customer',
  })

  const loadData = async () => {
    setLoading(true)
    closeSnackbar()
    try {
      const [adminUsers, adminRoles] = await Promise.all([getAdminUsers(), getAdminRoles()])
      setUsers(adminUsers)
      setRoles(adminRoles)
      setCreateForm((current) => ({
        ...current,
        role: current.role || adminRoles[0]?.key || 'customer',
      }))
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudieron cargar usuarios y roles.', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    if (!canCreate) {
      showSnackbar('No tienes permisos para crear usuarios.', { variant: 'warning' })
      return
    }

    setCreateForm(getDefaultUserForm())
    setIsCreateModalOpen(true)
    closeSnackbar()
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setCreateForm(getDefaultUserForm())
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditForm(getDefaultUserForm())
    setEditingId('')
  }

  const openEditModal = (user) => {
    if (!canUpdate) {
      showSnackbar('No tienes permisos para editar usuarios.', { variant: 'warning' })
      return
    }

    setEditingId(user.id)
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: Boolean(user.isActive),
    })
    setIsEditModalOpen(true)
    closeSnackbar()
  }

  const applyFormChange = (setForm) => (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCreateChange = applyFormChange(setCreateForm)
  const handleEditChange = applyFormChange(setEditForm)

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    if (!canCreate) {
      showSnackbar('No tienes permisos para crear usuarios.', { variant: 'warning' })
      return
    }

    setSavingCreate(true)
    closeSnackbar()

    try {
      const payload = {
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        isActive: createForm.isActive,
      }

      if (createForm.password) {
        payload.password = createForm.password
      }

      if (!payload.password) {
        showSnackbar('Password requerida para crear un usuario.', { variant: 'warning' })
        setSavingCreate(false)
        return
      }

      await createAdminUser(payload)
      showSnackbar('Usuario creado correctamente.', { variant: 'success' })

      closeCreateModal()
      await loadData()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo crear el usuario.', {
        variant: 'error',
      })
    } finally {
      setSavingCreate(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!canUpdate) {
      showSnackbar('No tienes permisos para editar usuarios.', { variant: 'warning' })
      return
    }

    if (!editingId) {
      showSnackbar('No se encontro el usuario a editar.', { variant: 'warning' })
      return
    }

    setSavingEdit(true)
    closeSnackbar()

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.isActive,
      }

      if (editForm.password) {
        payload.password = editForm.password
      }

      await updateAdminUser(editingId, payload)
      showSnackbar('Usuario actualizado correctamente.', { variant: 'success' })

      closeEditModal()
      await loadData()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo actualizar el usuario.', {
        variant: 'error',
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const askDelete = (userId) => {
    if (!canDelete) {
      showSnackbar('No tienes permisos para eliminar usuarios.', { variant: 'warning' })
      return
    }

    setDeleteCandidateId(userId)
  }

  const handleDelete = async () => {
    if (!deleteCandidateId) {
      return
    }

    try {
      await deleteAdminUser(deleteCandidateId)
      showSnackbar('Usuario eliminado correctamente.', { variant: 'success' })
      setDeleteCandidateId('')
      await loadData()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo eliminar el usuario.', {
        variant: 'error',
      })
    }
  }

  return (
    <AdminLayout
      title="Gestion de Usuarios"
      actions={
        <div className="d-flex gap-2">
          {canCreate && (
            <button className="btn btn-dark" onClick={openCreateModal}>
              Nuevo usuario
            </button>
          )}
          <button className="btn btn-outline-dark" onClick={loadData}>
            Refrescar
          </button>
        </div>
      }
    >

        <Snackbar
          open={snackbar.open}
          mode="toast"
          title={snackbar.title}
          variant={snackbar.variant}
          message={snackbar.message}
          autoHideDuration={snackbar.autoHideDuration}
          onClose={closeSnackbar}
        />

        <Snackbar
          open={Boolean(deleteCandidateId)}
          mode="modal"
          title="Confirmar eliminacion"
          message="Esta accion eliminara el usuario. Deseas continuar?"
          onClose={() => setDeleteCandidateId('')}
          actions={[
            { label: 'Cancelar', className: 'btn btn-outline-dark', onClick: () => setDeleteCandidateId('') },
            { label: 'Eliminar', className: 'btn btn-danger', onClick: handleDelete },
          ]}
        />

        <Snackbar
          open={isCreateModalOpen}
          mode="modal"
          title="Crear usuario"
          onClose={closeCreateModal}
        >
          <form className="d-flex flex-column gap-2" onSubmit={handleCreateSubmit}>
            <input
              required
              name="name"
              className="form-control"
              placeholder="Nombre"
              value={createForm.name}
              onChange={handleCreateChange}
            />
            <input
              required
              type="email"
              name="email"
              className="form-control"
              placeholder="Correo"
              value={createForm.email}
              onChange={handleCreateChange}
            />
            <input
              required
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              value={createForm.password}
              onChange={handleCreateChange}
            />

            <select name="role" className="form-select" value={createForm.role} onChange={handleCreateChange}>
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
                checked={createForm.isActive}
                onChange={handleCreateChange}
              />
              <span className="form-check-label">Usuario activo</span>
            </label>

            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-dark" type="submit" disabled={savingCreate || !canCreate}>
                {savingCreate ? 'Guardando...' : 'Crear usuario'}
              </button>
              <button className="btn btn-outline-dark" type="button" onClick={closeCreateModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Snackbar>

        <Snackbar
          open={isEditModalOpen}
          mode="modal"
          title="Editar usuario"
          onClose={closeEditModal}
        >
          <form className="d-flex flex-column gap-2" onSubmit={handleEditSubmit}>
            <input
              required
              name="name"
              className="form-control"
              placeholder="Nombre"
              value={editForm.name}
              onChange={handleEditChange}
            />
            <input
              required
              type="email"
              name="email"
              className="form-control"
              placeholder="Correo"
              value={editForm.email}
              onChange={handleEditChange}
            />
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Nuevo password (opcional)"
              value={editForm.password}
              onChange={handleEditChange}
            />

            <select name="role" className="form-select" value={editForm.role} onChange={handleEditChange}>
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
                checked={editForm.isActive}
                onChange={handleEditChange}
              />
              <span className="form-check-label">Usuario activo</span>
            </label>

            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-dark" type="submit" disabled={savingEdit || !canUpdate}>
                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className="btn btn-outline-dark" type="button" onClick={closeEditModal}>
                Cancelar
              </button>
            </div>
          </form>
        </Snackbar>

      <div className="row g-4">
          <div className="col-12">
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
                                  <button className="btn btn-sm btn-outline-dark" onClick={() => openEditModal(user)}>
                                    Editar
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => askDelete(user.id)}
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
    </AdminLayout>
  )
}

export default AdminUsersPage
