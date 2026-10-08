import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

/**
 * Shared site navbar — one component, used on every page.
 *
 * Props:
 *  - links:       [{ to, label }]  route links shown in the center
 *  - actions:     JSX rendered on the right (buttons, a plain text link, etc.)
 *  - onHamburger: function — if provided, a mobile hamburger button renders
 *  - theme:       'dark' (default) | 'light'
 */
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
