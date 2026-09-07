import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

/**
 * Mobile menu that drops below the Navbar on small screens.
 * `links` are in-page anchors (e.g. #features); `authLinks` are routes.
 */
const MobileMenu = ({ open, links = [], authLinks = [] }) => {
  return (
    <div className={`site-mobile-menu${open ? ' open' : ''}`}>
      {links.map(link => (
        <a key={link.href} href={link.href}>{link.label}</a>
      ))}
      {authLinks.map(link => (
        <Link key={link.to} to={link.to}>{link.label}</Link>
      ))}
    </div>
  )
}

export default MobileMenu