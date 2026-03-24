import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { user: currentUser } = useAuth()

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.data)
    } catch { } finally { setLoading(false) }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${deleteModal.id}`)
      setDeleteModal(null)
      fetchUsers()
    } catch { } finally { setDeleting(false) }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="admin-page container">
      <h1 className="page-title">All Users</h1>
      <div className="card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.username}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.verified ? 'badge-success' : 'badge-warning'}`}>{u.verified ? '✓ Yes' : '✗ No'}</span></td>
                <td>
                  {u.username !== currentUser?.username && (
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(u)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">👤</div>
            <h2>Delete User?</h2>
            <p className="delete-modal-msg">
              You're about to delete <strong>"{deleteModal.username}"</strong>.<br />
              This will permanently remove their account and all associated data.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteModal(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
