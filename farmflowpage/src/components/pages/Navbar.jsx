import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

/**
 * Shared site navbar — one component, used on every page, so the header
 * never drifts out of sync between the marketing site and the app.
 *
 * Props:
 *  - links:       [{ href, label }]  section links shown in the center
 *                 (pass [] on pages that don't need them, e.g. auth/dashboard)
 *  - actions:     JSX rendered on the right (buttons, a plain text link, etc.)
 *  - onHamburger: function — if provided, a mobile hamburger button renders
 *                 and calls this on click (only needed when `links` is non-empty)
 */
const Navbar = ({ links = [], actions = null, onHamburger = null }) => {
  return (
    <nav className="site-nav" id="siteNav">
      <Link to="/" className="site-nav-logo">
        <div className="site-nav-logo-mark">CF</div>
        ChakFarm
      </Link>

      {links.length > 0 && (
        <ul className="site-nav-links">
          {links.map(link => (
            <li key={link.href}><a href={link.href}>{link.label}</a></li>
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