import { useState, useEffect } from 'react'
import api from '../api/axios'
import './Orders.css'

const STATUS_CONFIG = {
  PLACED:    { badge: 'badge-placed',    icon: '🕐', label: 'Order Placed',  step: 1 },
  SHIPPED:   { badge: 'badge-shipped',   icon: '🚚', label: 'Shipped',       step: 2 },
  DELIVERED: { badge: 'badge-delivered', icon: '✅', label: 'Delivered',     step: 3 },
  CANCELLED: { badge: 'badge-cancelled', icon: '❌', label: 'Cancelled',     step: 0 },
}

const TRACK_STEPS = [
  { icon: '📦', label: 'Order Placed' },
  { icon: '🔄', label: 'Processing' },
  { icon: '🚚', label: 'Shipped' },
  { icon: '🏠', label: 'Delivered' },
]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res.data.data)
      if (res.data.data.length > 0) setExpandedId(res.data.data[0].id)
    } catch { } finally { setLoading(false) }
  }

  const payOrder = async (orderId) => {
    setPayingId(orderId)
    try {
      await api.post(`/orders/${orderId}/pay`)
      setMsg('Payment successful!')
      fetchOrders()
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Payment failed')
      setTimeout(() => setMsg(''), 3000)
    } finally { setPayingId(null) }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="orders-page">
      <div className="orders-hero">
        <div className="container">
          <h1>My Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      <div className="container orders-body">
        {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-illustration">📦</div>
            <h2>No orders yet</h2>
            <p>Looks like you haven't placed any orders. Start shopping!</p>
            <a href="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED
              const isExpanded = expandedId === order.id
              return (
                <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>

                  {/* Header */}
                  <div className="order-header" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                    <div className="order-header-left">
                      <div className="order-icon">{cfg.icon}</div>
                      <div>
                        <div className="order-title">Order #{order.id}</div>
                        <div className="order-meta">
                          {new Date(order.createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          &nbsp;·&nbsp;{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="order-header-right">
                      <div className="order-amount">₹{Number(order.totalAmount).toLocaleString('en-IN')}</div>
                      <span className={`status-badge ${cfg.badge}`}>{cfg.label}</span>
                      <span className="expand-arrow">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="order-body">

                      {/* Tracker */}
                      {order.status !== 'CANCELLED' && (
                        <div className="tracker">
                          {TRACK_STEPS.map((s, i) => {
                            const stepNum = i + 1
                            const active = cfg.step >= stepNum
                            const current = cfg.step === stepNum
                            return (
                              <div key={i} className={`track-step ${active ? 'active' : ''} ${current ? 'current' : ''}`}>
                                <div className="track-dot">
                                  {active ? <span className="dot-icon">{s.icon}</span> : <span className="dot-num">{stepNum}</span>}
                                </div>
                                {i < TRACK_STEPS.length - 1 && <div className={`track-line ${cfg.step > stepNum ? 'filled' : ''}`} />}
                                <div className="track-label">{s.label}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Items */}
                      <div className="order-items-section">
                        <h4>Items Ordered</h4>
                        <div className="order-items-list">
                          {order.items.map((item, i) => (
                            <div key={i} className="order-item-row">
                              <div className="item-emoji">{getEmoji(item.productName)}</div>
                              <div className="item-details">
                                <span className="item-name">{item.productName}</span>
                                <span className="item-unit">₹{Number(item.priceAtPurchase).toLocaleString('en-IN')} each</span>
                              </div>
                              <div className="item-qty">× {item.quantity}</div>
                              <div className="item-subtotal">₹{Number(item.subtotal).toLocaleString('en-IN')}</div>
                            </div>
                          ))}
                        </div>

                        <div className="order-summary-row">
                          <div className="summary-line"><span>Subtotal</span><span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span></div>
                          <div className="summary-line"><span>Delivery</span><span className="free-tag">FREE</span></div>
                          <div className="summary-line total-line"><span>Total Paid</span><span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span></div>
                        </div>
                      </div>

                      {/* Pay Now */}
                      {order.status === 'PLACED' && (
                        <div className="order-action">
                          <button className="btn btn-primary" onClick={() => payOrder(order.id)} disabled={payingId === order.id}>
                            {payingId === order.id ? '⏳ Processing...' : '💳 Pay Now'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getEmoji(name = '') {
  const n = name.toLowerCase()
  if (n.includes('iphone') || n.includes('samsung') || n.includes('macbook') || n.includes('boat') || n.includes('sony') || n.includes('headphone')) return '💻'
  if (n.includes('nike') || n.includes('adidas') || n.includes('yoga') || n.includes('sport')) return '⚽'
  if (n.includes('shirt') || n.includes('jeans') || n.includes('cloth') || n.includes('dress')) return '👕'
  if (n.includes('book') || n.includes('habit') || n.includes('alchemist') || n.includes('psychology') || n.includes('money')) return '📚'
  if (n.includes('dyson') || n.includes('philips') || n.includes('instant') || n.includes('pot')) return '🏠'
  if (n.includes('lakme') || n.includes('maybelline') || n.includes('beauty')) return '💄'
  return '🛍️'
}
