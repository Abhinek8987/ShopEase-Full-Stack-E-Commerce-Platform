import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Auth.css'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])
  const navigate = useNavigate()

  const startResendTimer = () => {
    setResendTimer(60)
    const t = setInterval(() => {
      setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 })
    }, 1000)
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess(`OTP sent to ${email}`)
      setStep(2); startResendTimer()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (otp.join('').length < 6) return setError('Enter all 6 digits')
    setError(''); setStep(3)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) return setError('Passwords do not match')
    setError(''); setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword: passwords.newPassword })
      setSuccess('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess('New OTP sent!'); setError(''); startResendTimer()
    } catch (err) { setError(err.response?.data?.message || 'Failed') }
  }

  const stepLabels = ['Email', 'Verify OTP', 'New Password']

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1>Reset Password</h1>
          <p>{stepLabels[step - 1]}</p>
        </div>

        <div className="step-indicator">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step > s ? 'done' : step === s ? 'active' : ''}`} />
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Registered Email Address</label>
              <input type="email" placeholder="your@email.com" value={email} required
                onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="auth-btn" disabled={loading}>
              {loading ? '⏳ Sending OTP...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
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
            <button className="auth-btn">Verify OTP →</button>
            <div className="resend-row">
              {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : <><span>Didn't receive? </span><button type="button" onClick={handleResend}>Resend OTP</button></>
              }
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Min 6 characters" required
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Repeat new password" required
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
            </div>
            <button className="auth-btn" disabled={loading}>
              {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember it? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
