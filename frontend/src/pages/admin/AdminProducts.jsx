import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './Admin.css'

const empty = { name: '', description: '', price: '', category: '', stockQuantity: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleteModal, setDeleteModal] = useState(null) // holds product to delete
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?size=100')
      setProducts(res.data.data.content)
    } catch { } finally { setLoading(false) }
  }

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stockQuantity: p.stockQuantity })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form)
        setMsg('Product updated!')
      } else {
        await api.post('/products', form)
        setMsg('Product created!')
      }
      setModal(false)
      fetchProducts()
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Save failed')
      setTimeout(() => setMsg(''), 2500)
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await api.delete(`/products/${deleteModal.id}`)
      setDeleteModal(null)
      fetchProducts()
    } catch { } finally { setDeleting(false) }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="admin-page container">
      <div className="admin-toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      {msg && <div className={`alert ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div className="card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <strong>{p.name}</strong><br />
                  <small style={{ color: 'var(--text-muted)' }}>{p.description?.slice(0, 50)}</small>
                </td>
                <td><span className="badge badge-info">{p.category}</span></td>
                <td>₹{Number(p.price).toLocaleString()}</td>
                <td><span className={`badge ${p.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}`}>{p.stockQuantity}</span></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="form-group"><label>Price (₹)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Stock Quantity</label><input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} required /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h2>Delete Product?</h2>
            <p className="delete-modal-msg">
              You're about to delete <strong>"{deleteModal.name}"</strong>.<br />
              This action cannot be undone.
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
