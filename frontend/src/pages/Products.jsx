import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [addingId, setAddingId] = useState(null)
  const [msg, setMsg] = useState('')
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) fetchByCategory(cat)
    else fetchProducts()
  }, [page, searchParams])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/products?page=${page}&size=9`)
      setProducts(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    } catch { } finally { setLoading(false) }
  }

  const fetchByCategory = async (cat) => {
    setLoading(true)
    try {
      const res = await api.get(`/products/category/${cat}`)
      setProducts(res.data.data)
      setTotalPages(1)
    } catch { } finally { setLoading(false) }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return fetchProducts()
    setLoading(true)
    try {
      const res = await api.get(`/products/search?name=${search}`)
      setProducts(res.data.data)
      setTotalPages(1)
    } catch { } finally { setLoading(false) }
  }

  const addToCart = async (productId) => {
    if (!user) return navigate('/login')
    setAddingId(productId)
    try {
      await api.post('/cart/add', { productId, quantity: 1 })
      await refreshCart()
      navigate('/cart')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add to cart')
      setTimeout(() => setMsg(''), 2000)
      setAddingId(null)
    }
  }

  return (
    <div className="products-page container">
      <div className="products-header">
        <h1 className="page-title">All Products</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input type="text" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </div>

      {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {loading ? <div className="spinner" /> : (
        <>
          {products.length === 0 ? (
            <div className="empty-state"><div className="icon">📦</div><p>No products found.</p></div>
          ) : (
            <div className="products-grid">
              {products.map(p => (
                <div key={p.id} className="product-card card">
                  <div className="product-img">{getCatEmoji(p.category)}</div>
                  <div className="product-info">
                    <span className="product-category">{p.category}</span>
                    <h3><Link to={`/products/${p.id}`}>{p.name}</Link></h3>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-footer">
                      <span className="product-price">₹{Number(p.price).toLocaleString()}</span>
                      <span className={`badge ${p.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 10 }}
                      onClick={() => addToCart(p.id)} disabled={addingId === p.id || p.stockQuantity === 0}>
                      {addingId === p.id ? 'Adding...' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Prev</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function getCatEmoji(cat) {
  const map = { Electronics: '💻', Clothing: '👕', Books: '📚', Home: '🏠', Sports: '⚽', Beauty: '💄' }
  return map[cat] || '🛍️'
}
