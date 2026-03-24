import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount, refreshCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) refreshCart()
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">🛍️ ShopEase</Link>

        <div className="navbar-links">
          <Link to="/products" className={isActive('/products')}>Products</Link>
          {user && (
            <Link to="/cart" className={`cart-link ${isActive('/cart')}`}>
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}
          {user && <Link to="/orders" className={isActive('/orders')}>My Orders</Link>}
          {isAdmin && (
            <div className="dropdown">
              <span className="dropdown-trigger">Admin ▾</span>
              <div className="dropdown-menu">
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/products">Products</Link>
                <Link to="/admin/orders">Orders</Link>
                <Link to="/admin/users">Users</Link>
              </div>
            </div>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <span className="navbar-user">👤 {user.username}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
