import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './Admin.css'

const STATUS_BADGE = { PLACED: 'badge-warning', SHIPPED: 'badge-info', DELIVERED: 'badge-success', CANCELLED: 'badge-danger' }
const NEXT_STATUS = { PLACED: 'SHIPPED', SHIPPED: 'DELIVERED' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all')
      setOrders(res.data.data)
    } catch { } finally { setLoading(false) }
  }

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await api.put(`/orders/admin/${orderId}/status?status=${status}`)
      fetchOrders()
    } catch { } finally { setUpdatingId(null) }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="admin-page container">
      <h1 className="page-title">All Orders</h1>
      <div className="card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <>
                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <td>#{order.id}</td>
                  <td>{order.username}</td>
                  <td><strong>₹{Number(order.totalAmount).toLocaleString()}</strong></td>
                  <td><span className={`badge ${STATUS_BADGE[order.status] || 'badge-info'}`}>{order.status}</span></td>
                  <td>{new Date(order.createdDate).toLocaleDateString('en-IN')}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {NEXT_STATUS[order.status] && (
                      <button className="btn btn-primary btn-sm" disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}>
                        {updatingId === order.id ? '...' : `→ ${NEXT_STATUS[order.status]}`}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr key={`exp-${order.id}`}>
                    <td colSpan={6} style={{ background: '#f8fafc', padding: '12px 16px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16, padding: '4px 0', fontSize: 13 }}>
                          <span style={{ flex: 1 }}>{item.productName}</span>
                          <span>x{item.quantity}</span>
                          <span>₹{Number(item.subtotal).toLocaleString()}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
