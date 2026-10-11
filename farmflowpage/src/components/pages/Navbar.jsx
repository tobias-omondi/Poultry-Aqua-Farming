import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'
const Navbar = ({ links = [], actions = null, onHamburger = null, theme = 'dark' }) => {
  return (
    <nav className={`site-nav${theme === 'light' ? ' site-nav--light' : ''}`} id="siteNav">
      <Link to="/" className="site-nav-logo">
        <div className="site-nav-logo-mark">CF</div>
        ChakFarm
      </Link>

      {links.length > 0 && (
        <ul className="site-nav-links">
          {links.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}

      <div className="site-nav-spacer" />

      {actions && <div className="site-nav-actions">{actions}</div>}

      {onHamburger && (
        <button className="site-nav-hamburger" onClick={onHamburger} aria-label="Menu">
          <span /><span /><span />
        </button>
      )}
    </nav>
  )
}

export default Navbar
