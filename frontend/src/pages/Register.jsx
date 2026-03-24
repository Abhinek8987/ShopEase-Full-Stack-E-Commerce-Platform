import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const [step, setStep] = useState(1) // 1=form, 2=otp
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])
  const { login } = useAuth()
  const navigate = useNavigate()

  const startResendTimer = () => {
    setResendTimer(60)
    const t = setInterval(() => {
      setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await api.post('/auth/register', { username: form.username, email: form.email, password: form.password })
      setSuccess(`OTP sent to ${form.email}`)
      setStep(2)
      startResendTimer()
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return setError('Enter all 6 digits')
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: code })
      login(res.data.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try {
      await api.post(`/auth/resend-otp?email=${encodeURIComponent(form.email)}`)
      setSuccess('New OTP sent!'); setError('')
      startResendTimer()
    } catch (err) { setError(err.response?.data?.message || 'Failed to resend') }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🛍️</div>
          <h1>Create Account</h1>
          <p>{step === 1 ? 'Join ShopEase and start shopping' : 'Enter the OTP sent to your email'}</p>
        </div>

        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input placeholder="Choose a username" value={form.username} required
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@email.com" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} required
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm} required
                onChange={e => setForm({ ...form, confirm: e.target.value })} />
            </div>
            <button className="auth-btn" disabled={loading}>
              {loading ? '⏳ Sending OTP...' : 'Create Account →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: 16 }}>Enter 6-digit OTP</label>
              <div className="otp-inputs">
                {otp.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)} />
                ))}
              </div>
            </div>
            <button className="auth-btn" disabled={loading}>
              {loading ? '⏳ Verifying...' : '✅ Verify & Continue'}
            </button>
            <div className="resend-row">
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : <><span>Didn't receive? </span><button type="button" onClick={handleResend}>Resend OTP</button></>
              }
            </div>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
