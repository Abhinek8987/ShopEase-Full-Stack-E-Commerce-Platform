import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🛍️</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your ShopEase account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Enter your username" value={form.username} required
              onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password} required
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
            <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: 14, fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>


      </div>
    </div>
  )
}
