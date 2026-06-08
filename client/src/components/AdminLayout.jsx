import AdminSidebar from './AdminSidebar.jsx'

function AdminLayout({ title, actions, children }) {
  return (
    <section className="py-4 py-lg-5">
      <div className="container">
        <div className="admin-layout">
          <AdminSidebar />

          <div className="admin-main">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h1 className="section-title m-0">{title}</h1>
              {actions ? <div className="d-flex gap-2 flex-wrap">{actions}</div> : null}
            </div>

            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminLayout
