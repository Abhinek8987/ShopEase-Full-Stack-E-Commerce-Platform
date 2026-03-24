import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import api from '../../api/axios'
import './Admin.css'

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#6366f1']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  const orderStatusData = [
    { name: 'Pending', value: Number(stats.pendingOrders), color: '#f59e0b' },
    { name: 'Shipped', value: Number(stats.shippedOrders), color: '#3b82f6' },
    { name: 'Delivered', value: Number(stats.deliveredOrders), color: '#22c55e' },
  ].filter(d => d.value > 0)

  const barData = [
    { name: 'Users', value: Number(stats.totalUsers), fill: '#6366f1' },
    { name: 'Products', value: Number(stats.totalProducts), fill: '#8b5cf6' },
    { name: 'Orders', value: Number(stats.totalOrders), fill: '#06b6d4' },
    { name: 'Delivered', value: Number(stats.deliveredOrders), fill: '#22c55e' },
  ]

  const revenueData = [
    { name: 'Pending', amount: 0 },
    { name: 'Processing', amount: Math.round(Number(stats.totalRevenue) * 0.1) },
    { name: 'Shipped', amount: Math.round(Number(stats.totalRevenue) * 0.3) },
    { name: 'Delivered', amount: Number(stats.totalRevenue) },
  ]

  return (
    <div className="admin-page container">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="#6366f1" />
        <StatCard icon="📦" label="Total Products" value={stats.totalProducts} color="#8b5cf6" />
        <StatCard icon="🛒" label="Total Orders" value={stats.totalOrders} color="#06b6d4" />
        <StatCard icon="💰" label="Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString()}`} color="#22c55e" />
        <StatCard icon="⏳" label="Pending" value={stats.pendingOrders} color="#f59e0b" />
        <StatCard icon="🚚" label="Shipped" value={stats.shippedOrders} color="#3b82f6" />
        <StatCard icon="✅" label="Delivered" value={stats.deliveredOrders} color="#22c55e" />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">

        {/* Bar Chart */}
        <div className="chart-card card">
          <h3 className="chart-title">Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-card card">
          <h3 className="chart-title">Order Status</h3>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No orders yet</div>
          )}
        </div>

        {/* Line Chart */}
        <div className="chart-card card chart-wide">
          <h3 className="chart-title">Revenue Progression</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v.toLocaleString()}`} />
              <Tooltip
                formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone" dataKey="amount"
                stroke="#6366f1" strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="admin-quick-links">
        <h2>Quick Actions</h2>
        <div className="quick-links-grid">
          <Link to="/admin/products" className="quick-link card">📦 Manage Products</Link>
          <Link to="/admin/orders" className="quick-link card">🛒 Manage Orders</Link>
          <Link to="/admin/users" className="quick-link card">👥 Manage Users</Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card card">
      <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
