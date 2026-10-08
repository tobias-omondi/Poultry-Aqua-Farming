import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import { NAV_LINKS } from './navLinks'
import './PageLayout.css'

const AUTH_LINKS = [
  { to: '/login', label: 'Sign in' },
  { to: '/register', label: 'Get Started →' },
]

/** Light-themed shell (navbar + mobile menu) for the nav pages. */
const PageLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Paint <body> light too (overscroll / areas outside the wrapper)
  useEffect(() => {
    document.body.classList.add('light-bg')
    return () => document.body.classList.remove('light-bg')
  }, [])
  return (
    <div className="light-page">
      <Navbar
        theme="light"
        links={NAV_LINKS}
        actions={
          <>
            <Link to="/login" className="site-btn-ghost">Sign in</Link>
            <Link to="/register" className="site-btn-solid">Get Started</Link>
          </>
        }
        onHamburger={() => setMenuOpen(o => !o)}
      />
      <MobileMenu
        theme="light"
        open={menuOpen}
        links={NAV_LINKS}
        authLinks={AUTH_LINKS}
        onNavigate={() => setMenuOpen(false)}
      />
      <main className="page-main">{children}</main>
    </div>
  )
}

export default PageLayout
