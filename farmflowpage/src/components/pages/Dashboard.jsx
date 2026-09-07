import React from 'react'
import { Link } from 'react-router-dom'


// Placeholder — the real dashboard (batches, mortality, P&L, buyer ledger,
// AI advisor) gets built out next. This just gives sign-in somewhere to land.
const Dashboard = () => {
  return (
    <div className="dash-page">
      <nav className="dash-navbar">
        <Link to="/" className="dash-nav-logo">
          <div className="dash-nav-logo-mark">CF</div>
          ChakFarm
        </Link>
        <div className="dash-nav-spacer" />
        <Link to="/login" className="dash-nav-link">Sign out</Link>
      </nav>

      <div className="dash-container">
        <div className="dash-eyebrow">Livestock Dashboard</div>
        <h1 className="dash-title">You're in.</h1>
        <p className="dash-sub">
          This is where your batches, mortality log, P&amp;L, and buyer ledger will live.
        </p>
      </div>
    </div>
  )
}

export default Dashboard