import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

/**
 * Mobile dropdown menu. Links are routes ({ to, label }).
 * onNavigate (optional) is called when a link is tapped, so the parent can close the menu.
 */
const MobileMenu = ({ open, links = [], authLinks = [], onNavigate, theme = 'dark' }) => (
  <div className={`site-mobile-menu${open ? ' open' : ''}${theme === 'light' ? ' site-mobile-menu--light' : ''}`}>
    {[...links, ...authLinks].map(l => (
      <Link key={l.to} to={l.to} onClick={onNavigate}>{l.label}</Link>
    ))}
  </div>
)

export default MobileMenu
