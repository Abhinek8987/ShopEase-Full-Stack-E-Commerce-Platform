import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState('')
  const [adding, setAdding] = useState(false)
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    if (!user) return navigate('/login')
    setAdding(true)
    try {
      await api.post('/cart/add', { productId: product.id, quantity: qty })
      await refreshCart()
      navigate('/cart')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add to cart')
      setTimeout(() => setMsg(''), 3000)
      setAdding(false)
    }
  }

  if (loading) return <div className="spinner" />
  if (!product) return null

  return (
    <div className="product-detail container">
      <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="detail-grid card">
        <div className="detail-img">{getCatEmoji(product.category)}</div>
        <div className="detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>
          <div className="detail-price">₹{Number(product.price).toLocaleString()}</div>
          <div className="stock-info">
            <span className={`badge ${product.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>
          {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          {product.stockQuantity > 0 && (
            <div className="qty-row">
              <label>Quantity:</label>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}>+</button>
              </div>
              <button className="btn btn-primary" onClick={addToCart} disabled={adding}>
                {adding ? 'Adding...' : '🛒 Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getCatEmoji(cat) {
  const map = { Electronics: '💻', Clothing: '👕', Books: '📚', Home: '🏠', Sports: '⚽', Beauty: '💄' }
  return map[cat] || '🛍️'
}
