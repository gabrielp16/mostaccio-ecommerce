import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import AdminLayout from '../components/AdminLayout.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import {
  createAdminRole,
  deleteAdminRole,
  getAdminPermissions,
  getAdminRoles,
  updateAdminRole,
} from '../services/api.js'

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
  const canReadPermissions = hasPermission('permissions:read') || hasPermission('roles:read')

  const [roles, setRoles] = useState([])
  const [permissionsCatalog, setPermissionsCatalog] = useState([])
  const [createForm, setCreateForm] = useState(initialForm)
  const [editForm, setEditForm] = useState(initialForm)
  const [editingRoleId, setEditingRoleId] = useState('')
  const [editingIsSystem, setEditingIsSystem] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingCreate, setSavingCreate] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const permissionOptions = useMemo(
    () => permissionsCatalog.map((permission) => permission.key),
    [permissionsCatalog],
  )

  const loadRoles = async () => {
    setLoading(true)
    closeSnackbar()
    try {
      const [adminRoles, permissions] = await Promise.all([
        getAdminRoles(),
        canReadPermissions ? getAdminPermissions() : Promise.resolve([]),
      ])

      setRoles(adminRoles)
      setPermissionsCatalog(permissions)
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudieron cargar los roles.', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [canReadPermissions])

  const resetCreateForm = () => {
    setCreateForm(initialForm)
  }

  const resetEditForm = () => {
    setEditForm(initialForm)
    setEditingRoleId('')
    setEditingIsSystem(false)
  }

  const toggleCreatePermission = (permission) => {
    setCreateForm((current) => {
      const exists = current.permissions.includes(permission)
      return {
        ...current,
        permissions: exists
          ? current.permissions.filter((item) => item !== permission)
          : [...current.permissions, permission],
      }
    })
  }

  const toggleEditPermission = (permission) => {
    setEditForm((current) => {
      const exists = current.permissions.includes(permission)
      return {
        ...current,
        permissions: exists
          ? current.permissions.filter((item) => item !== permission)
          : [...current.permissions, permission],
      }
    })
  }

  const openCreateModal = () => {
    if (!canCreate) {
      showSnackbar('No tienes permisos para crear roles.', { variant: 'warning' })
      return
    }

    resetCreateForm()
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    resetCreateForm()
  }

  const handleEdit = (role) => {
    setEditingRoleId(role._id)
    setEditingIsSystem(Boolean(role.isSystem))
    setEditForm({
      key: role.key,
      name: role.name,
      permissions: role.permissions || [],
    })
    setIsEditModalOpen(true)
    closeSnackbar()
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    resetEditForm()
  }

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    setCreateForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()

    if (!canCreate) {
      showSnackbar('No tienes permisos para crear roles.', { variant: 'warning' })
      return
    }

    setSavingCreate(true)
    closeSnackbar()

    try {
      await createAdminRole({
        key: createForm.key,
        name: createForm.name,
        permissions: createForm.permissions,
      })
      showSnackbar('Rol creado correctamente.', { variant: 'success' })

      closeCreateModal()
      await loadRoles()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo guardar el rol.', { variant: 'error' })
    } finally {
      setSavingCreate(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    if (!canUpdate) {
      showSnackbar('No tienes permisos para editar roles.', { variant: 'warning' })
      return
    }

    if (!editingRoleId) {
      showSnackbar('No se pudo identificar el rol a editar.', { variant: 'error' })
      return
    }

    setSavingEdit(true)
    closeSnackbar()

    try {
      await updateAdminRole(editingRoleId, {
        name: editForm.name,
        permissions: editForm.permissions,
      })
      showSnackbar('Rol actualizado correctamente.', { variant: 'success' })

      closeEditModal()
      await loadRoles()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo guardar el rol.', { variant: 'error' })
    } finally {
      setSavingEdit(false)
    }
  }

  const askDelete = (role) => {
    if (!canDelete) {
      showSnackbar('No tienes permisos para eliminar roles.', { variant: 'warning' })
      return
    }

    if (role.isSystem) {
      showSnackbar('Los roles del sistema no se pueden eliminar.', { variant: 'warning' })
      return
    }

    setDeleteCandidate(role)
  }

  const handleDelete = async () => {
    if (!deleteCandidate) {
      return
    }

    try {
      await deleteAdminRole(deleteCandidate._id)
      showSnackbar('Rol eliminado correctamente.', { variant: 'success' })
      setDeleteCandidate(null)
      await loadRoles()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo eliminar el rol.', { variant: 'error' })
    }
  }

  return (
    <AdminLayout
      title="Gestion de Roles"
      actions={
        <>
          {canCreate && (
            <button className="btn btn-dark" onClick={openCreateModal}>
              Nuevo rol
            </button>
          )}
          {canReadPermissions && (
            <Link className="btn btn-outline-dark" to="/admin/permissions">
              Gestionar permisos
            </Link>
          )}
          <button className="btn btn-outline-dark" onClick={loadRoles}>
            Refrescar
          </button>
        </>
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
          open={Boolean(deleteCandidate)}
          mode="modal"
          title="Confirmar eliminacion"
          message="Esta accion eliminara el rol. Deseas continuar?"
          onClose={() => setDeleteCandidate(null)}
          actions={[
            { label: 'Cancelar', className: 'btn btn-outline-dark', onClick: () => setDeleteCandidate(null) },
            { label: 'Eliminar', className: 'btn btn-danger', onClick: handleDelete },
          ]}
        />

        <Snackbar
          open={isCreateModalOpen}
          mode="modal"
          title="Nuevo rol"
          onClose={closeCreateModal}
          closeOnBackdrop={!savingCreate}
        >
          <form className="d-flex flex-column gap-2" onSubmit={handleCreateSubmit}>
            <input
              required
              name="key"
              className="form-control"
              placeholder="Clave (ej: marketing_manager)"
              value={createForm.key}
              onChange={handleCreateChange}
            />
            <input
              required
              name="name"
              className="form-control"
              placeholder="Nombre descriptivo"
              value={createForm.name}
              onChange={handleCreateChange}
            />

            <div className="border rounded-3 p-3" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              <p className="small fw-semibold mb-2">Permisos</p>
              <div className="d-flex flex-column gap-2">
                {permissionOptions.map((permission) => (
                  <label key={`create-${permission}`} className="form-check d-flex align-items-center gap-2 mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={createForm.permissions.includes(permission)}
                      onChange={() => toggleCreatePermission(permission)}
                    />
                    <span className="form-check-label">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="d-flex gap-2 mt-2 justify-content-end">
              <button className="btn btn-outline-dark" type="button" onClick={closeCreateModal} disabled={savingCreate}>
                Cancelar
              </button>
              <button className="btn btn-dark" type="submit" disabled={savingCreate}>
                {savingCreate ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Snackbar>

        <Snackbar
          open={isEditModalOpen}
          mode="modal"
          title="Editar rol"
          onClose={closeEditModal}
          closeOnBackdrop={!savingEdit}
        >
          <form className="d-flex flex-column gap-2" onSubmit={handleEditSubmit}>
            <input
              name="key"
              className="form-control"
              value={editForm.key}
              disabled
              readOnly
            />
            <input
              required
              name="name"
              className="form-control"
              placeholder="Nombre descriptivo"
              value={editForm.name}
              onChange={handleEditChange}
            />

            <div className="border rounded-3 p-3" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              <p className="small fw-semibold mb-2">Permisos</p>
              <div className="d-flex flex-column gap-2">
                {permissionOptions.map((permission) => (
                  <label key={`edit-${permission}`} className="form-check d-flex align-items-center gap-2 mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={editForm.permissions.includes(permission)}
                      onChange={() => toggleEditPermission(permission)}
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

            <div className="d-flex gap-2 mt-2 justify-content-end">
              <button className="btn btn-outline-dark" type="button" onClick={closeEditModal} disabled={savingEdit}>
                Cancelar
              </button>
              <button className="btn btn-dark" type="submit" disabled={savingEdit}>
                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Snackbar>

      <div className="row g-4">
        <div className="col-12">
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
                          <tr key={role._id} className="border-bottom">
                            <td>
                              <div className="d-flex flex-column align-items-start gap-1">
                                <span>{role.name}</span>
                                {role.isSystem && <span className="badge text-bg-secondary">Sistema</span>}
                              </div>
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
                                    onClick={() => askDelete(role)}
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
    </AdminLayout>
  )
}

export default AdminRolesPage
