import React, { useEffect, useRef, useState } from 'react'
import './LandingPage.css'
import { Egg, Leaf, Beef, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import chicken from "/src/assets/chicken.jpg"
import goat from "/src/assets/goat.jpg"
import cow from "/src/assets/cow.jpg"

// images

const images = [
  {image: chicken, label: "chicken farming"},
  {image: goat, label: "goat farming"},
  {image: cow, label: "cattle farming"},
]
// ── DATA ──────────────────────────────────────────────────────
const FARM_TYPES = [
  {
    image: chicken,
    name: 'Kienyeji Chicken',
    sub: 'Indigenous poultry farming',
    breeds: [
      { name: 'Kari Improved Kienyeji', badge: 'Popular', type: 'popular' },
      { name: 'Rainbow Rooster', badge: 'Profitable', type: 'profitable' },
      { name: 'Kenbro', badge: 'Premium', type: 'premium' },
      { name: 'Indigenous Local', badge: 'Common', type: 'common' },
    ],
    count: '4 breeds',
  },
  {
    image: goat,
    name: 'Goat Farming',
    sub: 'Meat & dairy goats',
    breeds: [
      { name: 'Boer Goat', badge: 'Popular', type: 'popular' },
      { name: 'Galla Goat', badge: 'Profitable', type: 'profitable' },
      { name: 'Toggenburg', badge: 'Premium', type: 'premium' },
      { name: 'Small East African', badge: 'Common', type: 'common' },
    ],
    count: '4 breeds',
  },
  {
    image: cow,
    name: 'Cattle Farming',
    sub: 'Beef & dairy breeds',
    breeds: [
      { name: 'Friesian', badge: 'Popular', type: 'popular' },
      { name: 'Ayrshire', badge: 'Profitable', type: 'profitable' },
      { name: 'Boran', badge: 'Premium', type: 'premium' },
      { name: 'Zebu (Boran)', badge: 'Common', type: 'common' },
    ],
    count: '4 breeds',
  },
]

const FEATURES = [
  {
    icon: '🐔',
    iconClass: 'green',
    title: 'Batch Lifecycle Tracking',
    desc: 'Follow every flock from day-1 chicks to final sale. Log daily feed, mortality, and weight. Close a batch and instantly see your real profit.',
    wide: true,
    stats: [
      { num: 'FCR', label: 'Feed conversion' },
      { num: '100%', label: 'Cost visibility' },
    ],
  },
  {
    icon: '📊',
    iconClass: 'amber',
    title: 'Live P&L Engine',
    desc: 'Every shilling tracked. Revenue minus costs per batch — not estimates, real numbers updated as you log.',
    wide: false,
  },
  {
    icon: '📦',
    iconClass: 'sage',
    title: 'Smart Inventory',
    desc: 'Feed stock, medications, and supplies with automatic low-stock alerts and supplier price history.',
    wide: false,
  },
  {
    icon: '🤖',
    iconClass: 'amber',
    title: 'AI Farm Advisor',
    desc: 'Ask questions about your farm data. Get forecasts, anomaly alerts, and recommendations on when to harvest or restock.',
    wide: true,
    stats: [
      { num: 'Chat', label: 'Farm assistant' },
      { num: 'Auto', label: 'Insights' },
    ],
  },
  {
    icon: '🏠',
    iconClass: 'green',
    title: 'Housing Management',
    desc: 'Manage multiple pens and coops. Track capacity, occupancy, and batch assignments.',
    wide: false,
  },
]

const TESTIMONIALS = [
  {
    stars: '★★★★★',
    quote: '"Before FarmFlow I had no idea which batch was actually profitable. Now I know the profit per bird before I go to market."',
    name: 'James Mwangi',
    role: 'Broiler Farmer · Kiambu',
    initials: 'JM',
    avatarClass: 'av-green',
  },
  {
    stars: '★★★★★',
    quote: '"The inventory alerts alone saved me — I never run out of feed mid-cycle anymore. The AI recommendations are surprisingly accurate."',
    name: 'Amina Hassan',
    role: 'Kienyeji Farmer · Mombasa',
    initials: 'AH',
    avatarClass: 'av-amber',
  },
]

const MARQUEE_ITEMS = [
  { emoji: '🐔', text: 'Batch Tracking' },
  { emoji: '📊', text: 'P&L Engine' },
  { emoji: '📦', text: 'Inventory Alerts' },
  { emoji: '🏠', text: 'Housing Management' },
  { emoji: '🤖', text: 'AI Advisor' },
  { emoji: '🐐', text: 'Goat Management' },
  { emoji: '🐄', text: 'Cattle Tracking' },
  { emoji: '💰', text: 'Cost Analytics' },
  { emoji: '🌿', text: 'Built for Kenya' },
]

// ── HOOKS ─────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function useNavScroll() {
  useEffect(() => {
    const nav = document.getElementById('lpNav')
    const handler = () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// ── SUB-COMPONENTS ────────────────────────────────────────────
function Navbar({ onHamburger }) {
  return (
    <nav className="lp-nav" id="lpNav">
      <a href="/" className="nav-logo">
        <div className="nav-logo-icon">🌿</div>
        FarmFlow
      </a>
      <ul className="nav-links">
        <li><a href="#farm-types">Farm Types</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#financials">Financials</a></li>
        <li><a href="#testimonials">Reviews</a></li>
      </ul>
      <div className="nav-actions">
        <a href="/login" className="btn-outline">Sign in</a>
        <a href="/register" className="btn-filled">Get Started</a>
      </div>
      <button className="nav-hamburger" onClick={onHamburger} aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  )
}

function MobileMenu({ open }) {
  return (
    <div className={`mobile-menu${open ? ' open' : ''}`}>
      <a href="#farm-types">Farm Types</a>
      <a href="#features">Features</a>
      <a href="#financials">Financials</a>
      <a href="#testimonials">Reviews</a>
      <a href="/login">Sign in</a>
      <a href="/register">Get Started →</a>
    </div>
  )
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="hero-bg-pattern" />
      <div className="hero-dots" />

      <div className="hero-content reveal">
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          Farm Intelligence Platform
        </div>

        <h1 className="hero-title">
          Know your farm.{' '}
          <span className="hero-title-green">Own your</span>{' '}
          <span className="hero-title-amber">numbers.</span>
        </h1>

        <p className="hero-desc">
          FarmFlow gives Kenyan farmers real-time P&L, batch lifecycle
          tracking, inventory alerts, and an AI advisor — covering chickens,
          goats, and cattle across all breeds.
        </p>

        <div className="hero-cta">
          <a href="/register" className="btn-hero-primary">
            Start free today <span>→</span>
          </a>
          <a href="#features" className="btn-hero-secondary">
            <span>▶</span> See how it works
          </a>
        </div>

        <div className="hero-trust">
          <div className="trust-item">
            <span className="trust-icon">✅</span>
            Free to start
          </div>
          <div className="trust-divider" />
          <div className="trust-item">
            <span className="trust-icon">🇰🇪</span>
            Kenya-built
          </div>
          <div className="trust-divider" />
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            Data protected
          </div>
        </div>
      </div>

      <div className="hero-visual reveal reveal-delay-2">
        <div className="hero-icon-grid">
          <div className="hero-icon-card chicken-card">
            <div className="hero-icon-frame chicken-frame">
              <Egg size={32} strokeWidth={1.5} />
            </div>
            <div className="hero-icon-label">Chicken</div>
            <div className="hero-icon-note">Layer + broiler</div>
          </div>
          <div className="hero-icon-card goat-card">
            <div className="hero-icon-frame goat-frame">
              <Leaf size={32} strokeWidth={1.5} />
            </div>
            <div className="hero-icon-label">Goat</div>
            <div className="hero-icon-note">Meat and dairy</div>
          </div>
          <div className="hero-icon-card cattle-card">
            <div className="hero-icon-frame cattle-frame">
              <Beef size={32} strokeWidth={1.5} />
            </div>
            <div className="hero-icon-label">Cattle</div>
            <div className="hero-icon-note">Beef + dairy</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="lp-marquee">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <div className="marquee-item" key={i}>
            <span className="marquee-emoji">{item.emoji}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function FarmTypes() {
  return (
    <section className="lp-section lp-section-alt" id="farm-types">
      <div className="section-header-center reveal">
        <div className="section-tag">What we track</div>
        <h2 className="section-title">
          Every animal. Every <em>breed.</em>
        </h2>
        <p className="section-sub">
          Built for Kenya’s livestock sector, FarmFlow tracks poultry, goats, and
          cattle with breed-aware cost models, performance benchmarks, and
          precision reporting.
        </p>
      </div>

      <div className="farm-types-grid">
        {FARM_TYPES.map((farm, i) => (
          <div className={`farm-type-card reveal reveal-delay-${i % 3}`} key={farm.name}>
            <div className="ftc-header">
              <div className="ftc-image-wrap">
                <img src={farm.image} alt={farm.name} className="ftc-image" />
              </div>
              <div className="ftc-title">{farm.name}</div>
              <div className="ftc-sub">{farm.sub}</div>
            </div>
            <div className="ftc-body">
              <div className="ftc-breeds-label">Tracked Breeds</div>
              <div className="ftc-breeds">
                {farm.breeds.map(breed => (
                  <div className="ftc-breed" key={breed.name}>
                    <span>{breed.name}</span>
                    <span className={`ftc-breed-badge badge-${breed.type}`}>
                      {breed.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ftc-footer">
              <span className="ftc-cta">Track this farm <span>→</span></span>
              <span className="ftc-count">{farm.count}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="lp-section" id="features">
      <div className="section-header-center reveal">
        <div className="section-tag">Platform Features</div>
        <h2 className="section-title">
          Everything your farm needs.<br />
          <span className="accent">Nothing it doesn't.</span>
        </h2>
        <p className="section-sub">
          Six tightly integrated modules covering the full lifecycle — from
          day-old chicks to final profit report.
        </p>
      </div>

      <div className="features-bento">
        {FEATURES.map((feat, i) => (
          <div
            className={`feat-card reveal reveal-delay-${i % 3}${feat.wide ? ' wide' : ''}`}
            key={feat.title}
          >
            <div className={`feat-icon ${feat.iconClass}`}>{feat.icon}</div>
            <div className="feat-title">{feat.title}</div>
            <p className="feat-desc">{feat.desc}</p>
            {feat.stats && (
              <div className="feat-mini-stats">
                {feat.stats.map(s => (
                  <div className="fms-item" key={s.label}>
                    <div className="fms-num">{s.num}</div>
                    <div className="fms-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function Financials() {
  return (
    <section className="lp-section lp-section-alt" id="financials">
      <div className="pl-split">
        <div className="reveal">
          <div className="section-tag">Profitability Engine</div>
          <h2 className="section-title">
            Stop guessing.<br />
            <em>Start knowing.</em>
          </h2>
          <p className="section-sub">
            Most farmers know their revenue. Few know their real profit. FarmFlow
            separates every cost category so you know exactly where your money
            goes — per batch, per bird, per season.
          </p>
          <div className="pl-checks">
            {[
              'Revenue minus costs per batch — not just total farm revenue',
              'Cost per bird calculated automatically from your daily logs',
              'Running P&L updates the moment you log anything',
              'Compare batch performance across breeds and seasons',
              'FCR tracking — know if your feed is converting efficiently',
              'Receipt photos attached to every purchase for audit trail',
            ].map(check => (
              <div className="pl-check" key={check}>
                <div className="pl-check-icon">✓</div>
                <span>{check}</span>
              </div>
            ))}
          </div>
          <a href="/register" className="btn-hero-primary" style={{ display: 'inline-flex' }}>
            See your numbers →
          </a>
        </div>

        <div className="dash-mock reveal reveal-delay-2">
          <div className="dash-topbar">
            <div className="dot dot-red" />
            <div className="dot dot-yellow" />
            <div className="dot dot-green" />
            <div className="dash-url">farmflow.ke/dashboard</div>
          </div>
          <div className="dash-body">
            <div className="dash-header">Farm Overview — May 2025</div>
            <div className="dash-stats-row">
              <div className="dash-stat">
                <div className="ds-l">Revenue</div>
                <div className="ds-v g">77,600</div>
              </div>
              <div className="dash-stat">
                <div className="ds-l">Costs</div>
                <div className="ds-v r">46,500</div>
              </div>
              <div className="dash-stat">
                <div className="ds-l">Profit</div>
                <div className="ds-v a">31,100</div>
              </div>
            </div>
            <div className="dash-batches">
              {[
                  { name: 'Batch #3', breed: 'Kenbro', profit: '+18,400', status: 'active' },
                  { name: 'Batch #2', breed: 'Kienyeji', profit: '+9,200', status: 'closed' },
                  { name: 'Boer Herd', breed: 'Boer Goat', profit: '+6,800', status: 'active' },
                ].map(row => (
                <div className="db-row" key={row.name}>
                  <div>
                    <div className="db-name">{row.name}</div>
                    <div className="db-breed">{row.breed}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="db-profit">{row.profit}</div>
                    <div className={`db-badge ${row.status}`}>{row.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="testimonial-section" id="testimonials">
      <div className="section-header-center reveal">
        <div className="section-tag">Farmer Stories</div>
        <h2 className="section-title">
          Trusted by farmers<br />
          <em>across Kenya.</em>
        </h2>
        <p className="section-sub">
          From broiler farmers in Kiambu to smallholders across Kenya —
          real results from real farms.
        </p>
      </div>

      <div className="testimonials-grid">
        {TESTIMONIALS.map((t, i) => (
          <div className={`testi-card reveal reveal-delay-${i}`} key={t.name}>
            <div className="testi-stars">{t.stars}</div>
            <p className="testi-quote">{t.quote}</p>
            <div className="testi-author">
              <div className={`testi-avatar ${t.avatarClass}`}>{t.initials}</div>
              <div>
                <div className="testi-name">{t.name}</div>
                <div className="testi-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-box reveal">
        <div className="cta-eyebrow">Start Today — It's Free</div>
        <h2 className="cta-title">
          Your farm deserves<br />
          <em>real numbers.</em>
        </h2>
        <p className="cta-sub">
          Join farmers across Kenya replacing notebooks and guesswork with
          live P&L, AI insights, and evidence that opens funding doors.
        </p>
        <div className="cta-actions">
          <a href="/register" className="btn-cta-main">
            Create free account →
          </a>
          <a href="/login" className="btn-cta-ghost">
            Sign in
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer({ onCookieSettings }) {
  return (
    <footer className="lp-footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand-name">🌿 FarmFlow</div>
          <p className="footer-brand-desc">
            Farm intelligence for the modern African farmer.
            Built in Nairobi, Kenya.
          </p>
        </div>
        <div>
          <div className="footer-col-head">Platform</div>
          <ul className="footer-col-links">
            <li><a href="#farm-types">Farm Types</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#financials">Financials</a></li>
            <li><a href="/register">Get Started</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-head">Legal</div>
          <ul className="footer-col-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onCookieSettings() }}>Cookie Settings</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-head">Contact</div>
          <ul className="footer-col-links">
            <li><a href="mailto:hello@farmflow.ke">hello@farmflow.ke</a></li>
            <li><a href="#">Nairobi, Kenya</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 FarmFlow. All rights reserved. Built in 🇰🇪 Nairobi.</span>
        <span>Kenya Data Protection Act 2019 compliant</span>
      </div>
    </footer>
  )
}

function CookieBanner({ visible, onAccept, onEssential, onClose }) {
  return (
    <div className={`cookie-banner${visible ? ' show' : ''}`}>
      <div className="cookie-inner">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-copy">
          <div className="cookie-title">We use cookies on FarmFlow</div>
          <div className="cookie-desc">
            Essential cookies keep you logged in. Analytics cookies help us
            improve the platform.{' '}
            <a href="#">Learn more</a> · Kenya Data Protection Act 2019.
          </div>
        </div>
        <div className="cookie-btns">
          <button className="cb-essential" onClick={onEssential}>
            Essential only
          </button>
          <button className="cb-accept" onClick={onAccept}>
            Accept all
          </button>
        </div>
        <button className="cb-close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────
const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cookieVisible, setCookieVisible] = useState(false)

  useScrollReveal()
  useNavScroll()

  // Check cookie consent on mount
  useEffect(() => {
    const saved = localStorage.getItem('farmflow-cookies')
    if (!saved) {
      const timer = setTimeout(() => setCookieVisible(true), 1400)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = async (consent) => {
    localStorage.setItem('farmflow-cookies', consent)
    setCookieVisible(false)
    try {
      await fetch('/api/auth/cookies/consent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ consent }),
      })
    } catch {
      // Saved locally
    }
  }

  const handleCookieSettings = () => {
    localStorage.removeItem('farmflow-cookies')
    setCookieVisible(true)
  }

  return (
    <>
      <Navbar onHamburger={() => setMenuOpen(o => !o)} />
      <MobileMenu open={menuOpen} />

      <main>
        <Hero />
        <Marquee />
        <FarmTypes />
        <Features />
        <Financials />
        <Testimonials />
        <CTA />
      </main>

      <Footer onCookieSettings={handleCookieSettings} />

      <CookieBanner
        visible={cookieVisible}
        onAccept={() => saveConsent('accepted')}
        onEssential={() => saveConsent('essential')}
        onClose={() => saveConsent('declined')}
      />
    </>
  )
}

export default LandingPage