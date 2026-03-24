import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-content">
          <h1>Shop the Best Products<br /><span>at Unbeatable Prices</span></h1>
          <p>Discover thousands of products across all categories. Fast delivery, easy returns.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
            {!user && <Link to="/register" className="btn btn-outline">Get Started</Link>}
          </div>
        </div>
      </section>

      <section className="features container">
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>Get your orders delivered quickly to your doorstep.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Payments</h3>
          <p>Your payment information is always safe with us.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">↩️</div>
          <h3>Easy Returns</h3>
          <p>Not satisfied? Return within 30 days, no questions asked.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎧</div>
          <h3>24/7 Support</h3>
          <p>Our support team is always here to help you.</p>
        </div>
      </section>

      <section className="categories container">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'].map(cat => (
            <Link key={cat} to={`/products?category=${cat}`} className="category-card">
              <span className="cat-icon">{getCatIcon(cat)}</span>
              <span>{cat}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function getCatIcon(cat) {
  const icons = { Electronics: '💻', Clothing: '👕', Books: '📚', Home: '🏠', Sports: '⚽', Beauty: '💄' }
  return icons[cat] || '🛍️'
}
