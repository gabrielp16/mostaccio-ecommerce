import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout.jsx'
import Snackbar from '../components/Snackbar.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useSnackbar } from '../hooks/useSnackbar.js'
import {
  createAdminPermission,
  deleteAdminPermission,
  getAdminPermissions,
  updateAdminPermission,
} from '../services/api.js'

const initialPermissionForm = {
  key: '',
  name: '',
  description: '',
}

function AdminPermissionsPage() {
  const { hasPermission } = useAuth()

  const canCreate = hasPermission('permissions:create') || hasPermission('roles:create')
  const canUpdate = hasPermission('permissions:update') || hasPermission('roles:update')
  const canDelete = hasPermission('permissions:delete') || hasPermission('roles:delete')

  const [permissions, setPermissions] = useState([])
  const [createForm, setCreateForm] = useState(initialPermissionForm)
  const [editForm, setEditForm] = useState(initialPermissionForm)
  const [editingId, setEditingId] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingCreate, setSavingCreate] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar()

  const loadPermissions = async () => {
    setLoading(true)
    closeSnackbar()

    try {
      const data = await getAdminPermissions()
      setPermissions(data)
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudieron cargar los permisos.', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    setCreateForm((current) => ({ ...current, [name]: value }))
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const openCreateModal = () => {
    if (!canCreate) {
      showSnackbar('No tienes permisos para crear permisos.', { variant: 'warning' })
      return
    }

    setCreateForm(initialPermissionForm)
    setIsCreateModalOpen(true)
    closeSnackbar()
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setCreateForm(initialPermissionForm)
  }

  const openEditModal = (permission) => {
    if (!canUpdate) {
      showSnackbar('No tienes permisos para editar permisos.', { variant: 'warning' })
      return
    }

    setEditingId(permission._id)
    setEditForm({
      key: permission.key,
      name: permission.name,
      description: permission.description || '',
    })
    setIsEditModalOpen(true)
    closeSnackbar()
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingId('')
    setEditForm(initialPermissionForm)
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()

    if (!canCreate) {
      showSnackbar('No tienes permisos para crear permisos.', { variant: 'warning' })
      return
    }

    setSavingCreate(true)
    closeSnackbar()

    try {
      await createAdminPermission(createForm)
      showSnackbar('Permiso creado correctamente.', { variant: 'success' })
      closeCreateModal()
      await loadPermissions()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo crear el permiso.', {
        variant: 'error',
      })
    } finally {
      setSavingCreate(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    if (!canUpdate) {
      showSnackbar('No tienes permisos para editar permisos.', { variant: 'warning' })
      return
    }

    if (!editingId) {
      showSnackbar('No se pudo identificar el permiso a editar.', { variant: 'error' })
      return
    }

    setSavingEdit(true)
    closeSnackbar()

    try {
      await updateAdminPermission(editingId, {
        name: editForm.name,
        description: editForm.description,
      })
      showSnackbar('Permiso actualizado correctamente.', { variant: 'success' })
      closeEditModal()
      await loadPermissions()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo actualizar el permiso.', {
        variant: 'error',
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const askDelete = (permission) => {
    if (!canDelete) {
      showSnackbar('No tienes permisos para eliminar permisos.', { variant: 'warning' })
      return
    }

    if (permission.isSystem) {
      showSnackbar('No se puede eliminar un permiso del sistema.', { variant: 'warning' })
      return
    }

    setDeleteCandidate(permission)
  }

  const handleDelete = async () => {
    if (!deleteCandidate) {
      return
    }

    try {
      await deleteAdminPermission(deleteCandidate._id)
      showSnackbar('Permiso eliminado correctamente.', { variant: 'success' })
      setDeleteCandidate(null)
      await loadPermissions()
    } catch (error) {
      showSnackbar(error?.response?.data?.message || 'No se pudo eliminar el permiso.', {
        variant: 'error',
      })
    }
  }

  return (
    <AdminLayout
      title="Gestion de Permisos"
      actions={
        <>
          {canCreate && (
            <button className="btn btn-dark" onClick={openCreateModal}>
              Nuevo permiso
            </button>
          )}
          <button className="btn btn-outline-dark" onClick={loadPermissions}>
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
        message="Esta accion eliminara el permiso. Deseas continuar?"
        onClose={() => setDeleteCandidate(null)}
        actions={[
          { label: 'Cancelar', className: 'btn btn-outline-dark', onClick: () => setDeleteCandidate(null) },
          { label: 'Eliminar', className: 'btn btn-danger', onClick: handleDelete },
        ]}
      />

      <Snackbar open={isCreateModalOpen} mode="modal" title="Nuevo permiso" onClose={closeCreateModal}>
        <form className="d-flex flex-column gap-2" onSubmit={handleCreateSubmit}>
          <input
            required
            name="key"
            className="form-control"
            placeholder="Clave (ej: reports:read)"
            value={createForm.key}
            onChange={handleCreateChange}
          />
          <input
            required
            name="name"
            className="form-control"
            placeholder="Nombre"
            value={createForm.name}
            onChange={handleCreateChange}
          />
          <textarea
            name="description"
            rows="3"
            className="form-control"
            placeholder="Descripcion"
            value={createForm.description}
            onChange={handleCreateChange}
          />

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

      <Snackbar open={isEditModalOpen} mode="modal" title="Editar permiso" onClose={closeEditModal}>
        <form className="d-flex flex-column gap-2" onSubmit={handleEditSubmit}>
          <input name="key" className="form-control" value={editForm.key} disabled readOnly />
          <input
            required
            name="name"
            className="form-control"
            placeholder="Nombre"
            value={editForm.name}
            onChange={handleEditChange}
          />
          <textarea
            name="description"
            rows="3"
            className="form-control"
            placeholder="Descripcion"
            value={editForm.description}
            onChange={handleEditChange}
          />

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

      <div className="floating-card p-4">
        <h2 className="h4 mb-3">Permisos existentes</h2>

        {loading ? (
          <p>Cargando permisos...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Permiso</th>
                  <th>Clave</th>
                  <th>Descripcion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-muted">
                      No hay permisos cargados.
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission) => (
                    <tr key={permission._id} className="border-bottom">
                      <td>
                        <div className="d-flex flex-column align-items-start gap-1">
                          <span>{permission.name}</span>
                          {permission.isSystem && <span className="badge text-bg-secondary">Sistema</span>}
                        </div>
                      </td>
                      <td>
                        <code>{permission.key}</code>
                      </td>
                      <td>{permission.description || <span className="text-muted">Sin descripcion</span>}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {canUpdate && (
                            <button className="btn btn-sm btn-outline-dark" onClick={() => openEditModal(permission)}>
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => askDelete(permission)}
                              disabled={permission.isSystem}
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
    </AdminLayout>
  )
}

export default AdminPermissionsPage
