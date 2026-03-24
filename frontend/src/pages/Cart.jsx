import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import './Cart.css'

const PAYMENT_METHODS = [
  { id: 'card', label: '💳 Credit / Debit Card' },
  { id: 'upi', label: '📱 UPI' },
  { id: 'netbanking', label: '🏦 Net Banking' },
  { id: 'cod', label: '💵 Cash on Delivery' },
]

const emptyAddress = { fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' }

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // Checkout flow: null | 'address' | 'payment' | 'processing' | 'success'
  const [step, setStep] = useState(null)
  const [address, setAddress] = useState(emptyAddress)
  const [payMethod, setPayMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [upiId, setUpiId] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const navigate = useNavigate()
  const { refreshCart } = useCart()

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
      setCart(res.data.data)
    } catch { } finally { setLoading(false) }
  }

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return
    try {
      const res = await api.put('/cart/update', { productId, quantity })
      setCart(res.data.data)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
      setTimeout(() => setMsg(''), 2000)
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/remove/${cartItemId}`)
      setCart(res.data.data)
      refreshCart()
    } catch { }
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setStep('processing')
    setPlacing(true)

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000))

    try {
      const res = await api.post('/orders')
      const newOrderId = res.data.data.id
      // Simulate pay API call
      await api.post(`/orders/${newOrderId}/pay`)
      setOrderId(newOrderId)
      setStep('success')
      refreshCart()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Payment failed. Please try again.')
      setStep('payment')
    } finally { setPlacing(false) }
  }

  if (loading) return <div className="spinner" />

  const items = cart?.items || []

  // ── Success screen ──
  if (step === 'success') {
    return (
      <div className="cart-page container">
        <div className="payment-success card">
          <div className="success-icon">🎉</div>
          <h2>Payment Successful!</h2>
          <p>Your order <strong>#{orderId}</strong> has been placed and is being processed.</p>
          <p className="delivery-info">📦 Estimated delivery: <strong>3–5 business days</strong></p>
          <p className="delivery-addr">📍 Delivering to: {address.addressLine}, {address.city}, {address.state} - {address.pincode}</p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
            <button className="btn btn-outline" onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Processing screen ──
  if (step === 'processing') {
    return (
      <div className="cart-page container">
        <div className="payment-processing card">
          <div className="processing-spinner" />
          <h2>Processing Payment...</h2>
          <p>Please wait, do not close this window.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page container">
      <h1 className="page-title">🛒 My Cart</h1>
      {msg && <div className={`alert ${msg.includes('✅') || msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <p>Your cart is empty.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.cartItemId} className="cart-item card">
                <div className="cart-item-emoji">{getCatEmoji(item.productName)}</div>
                <div className="cart-item-info">
                  <h3>{item.productName}</h3>
                  <p className="item-price">₹{Number(item.productPrice).toLocaleString()} each</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-subtotal">₹{Number(item.subtotal).toLocaleString()}</div>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.cartItemId)}>✕</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h2>Order Summary</h2>
            <div className="summary-row"><span>Items ({items.length})</span><span>₹{Number(cart.totalPrice).toLocaleString()}</span></div>
            <div className="summary-row"><span>Delivery</span><span className="free">FREE</span></div>
            <div className="summary-total"><span>Total</span><span>₹{Number(cart.totalPrice).toLocaleString()}</span></div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setStep('address')}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}

      {/* ── Address Modal ── */}
      {step === 'address' && (
        <div className="modal-overlay" onClick={() => setStep(null)}>
          <div className="modal checkout-modal" onClick={e => e.stopPropagation()}>
            <h2>📍 Delivery Address</h2>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input placeholder="John Doe" value={address.fullName} required
                    onChange={e => setAddress({ ...address, fullName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input placeholder="10-digit mobile" value={address.phone} required maxLength={10}
                    onChange={e => setAddress({ ...address, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Address Line</label>
                <input placeholder="House No, Street, Area" value={address.addressLine} required
                  onChange={e => setAddress({ ...address, addressLine: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input placeholder="City" value={address.city} required
                    onChange={e => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input placeholder="State" value={address.state} required
                    onChange={e => setAddress({ ...address, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input placeholder="6-digit pincode" value={address.pincode} required maxLength={6}
                    onChange={e => setAddress({ ...address, pincode: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Continue to Payment →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {step === 'payment' && (
        <div className="modal-overlay" onClick={() => setStep('address')}>
          <div className="modal checkout-modal" onClick={e => e.stopPropagation()}>
            <h2>💳 Payment</h2>
            <div className="order-amount-banner">
              Total Payable: <strong>₹{Number(cart.totalPrice).toLocaleString()}</strong>
            </div>

            <div className="payment-methods">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`pay-method ${payMethod === m.id ? 'selected' : ''}`}>
                  <input type="radio" name="payMethod" value={m.id}
                    checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} />
                  {m.label}
                </label>
              ))}
            </div>

            <form onSubmit={handlePayment}>
              {payMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input placeholder="1234 5678 9012 3456" maxLength={19} required
                      value={cardDetails.number}
                      onChange={e => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })} />
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input placeholder="Name on card" required value={cardDetails.name}
                      onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry (MM/YY)</label>
                      <input placeholder="MM/YY" maxLength={5} required value={cardDetails.expiry}
                        onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input placeholder="•••" maxLength={3} required type="password" value={cardDetails.cvv}
                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'upi' && (
                <div className="form-group">
                  <label>UPI ID</label>
                  <input placeholder="yourname@upi" required value={upiId}
                    onChange={e => setUpiId(e.target.value)} />
                </div>
              )}

              {payMethod === 'netbanking' && (
                <div className="form-group">
                  <label>Select Bank</label>
                  <select required>
                    <option value="">-- Select Bank --</option>
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB', 'Bank of Baroda'].map(b => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              {payMethod === 'cod' && (
                <div className="cod-info">
                  <p>💵 Pay ₹{Number(cart.totalPrice).toLocaleString()} in cash when your order is delivered.</p>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep('address')}>← Back</button>
                <button type="submit" className="btn btn-success" disabled={placing}>
                  {placing ? 'Processing...' : `Pay ₹${Number(cart.totalPrice).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function getCatEmoji(name) {
  if (!name) return '🛍️'
  const n = name.toLowerCase()
  if (n.includes('iphone') || n.includes('samsung') || n.includes('macbook') || n.includes('boat') || n.includes('sony')) return '💻'
  if (n.includes('nike') || n.includes('adidas') || n.includes('yoga')) return '⚽'
  if (n.includes('shirt') || n.includes('jeans') || n.includes('cloth')) return '👕'
  if (n.includes('book') || n.includes('habit') || n.includes('alchemist') || n.includes('psychology')) return '📚'
  if (n.includes('dyson') || n.includes('philips') || n.includes('instant')) return '🏠'
  if (n.includes('lakme') || n.includes('maybelline')) return '💄'
  return '🛍️'
}
