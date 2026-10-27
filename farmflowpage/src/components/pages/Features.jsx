import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'   // shared colours, buttons, feature cards, CTA and footer
import './Features.css'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import { NAV_LINKS } from './navLinks'
import {
  Layers, HeartPulse, BarChart3, Home, Wrench, TrendingUp,
  Users, Wheat, Syringe, Thermometer, Check,
} from 'lucide-react'

// ── FAKE IMAGE IMPORTS ────────────────────────────────────────
// Put your real screenshots or photos at these paths (or change the paths).
// Landscape images about 4:3 work best.
import batchImg from '/src/assets/batchpage.png'      // screenshot of a batch page
import healthImg from '/src/assets/dashboardscreebshort.png'    // vaccination / mortality screen, or healthy birds
import profitImg from '/src/assets/overviewpage.png'    // profit and loss screen
import advisorImg from '/src/assets/aianalyzer.png'  // AI advisor alerts screen

// ── CONTENT — edit freely ─────────────────────────────────────
const SPOTLIGHTS = [
  {
    tag: 'Batch tracking',
    title: 'Follow every batch from chick to sale.',
    desc: 'Open a batch the day your chicks arrive. Everything that happens after is logged against that batch, so you always know how it is doing.',
    points: [
      'Costs and events recorded per batch, not per farm',
      'Feed conversion ratio calculated for you',
      'Cost per bird from your daily logs',
      'Egg collection and egg sales for layer flocks',
    ],
    image: batchImg,
    alt: 'Batch tracking screen',
  },
  {
    tag: 'Health',
    title: 'Catch problems while they are small.',
    desc: 'Deaths, vaccinations and medicine stock all sit in one place, so nothing is forgotten and every loss has a reason on record.',
    points: [
      'Mortality logged with cause and date',
      'Survival rate worked out per batch',
      'Vaccination schedule, including Newcastle, Gumboro and fowl pox',
      'Medicine stock and dosage history',
    ],
    image: healthImg,
    alt: 'Mortality and vaccination screen',
  },
  {
    tag: 'Profit and loss',
    title: 'Know what each batch really earned.',
    desc: 'Revenue minus real cost, updated the moment you log a sale or a purchase, not guessed at the end of the season.',
    points: [
      'Feed and medicine counted against the batch that used them',
      'Equipment cost included in true batch cost',
      'Buyer ledger shows who has paid and who still owes',
      'Running profit you can check any day',
    ],
    image: profitImg,
    alt: 'Profit and loss screen',
  },
  {
    tag: 'AI advisor',
    title: 'Know when to buy, sell and protect your birds.',
    desc: 'The advisor reads your batch data, local prices and the forecast for your coop, then tells you what needs attention.',
    points: [
      'Sell signal when a batch reaches a good sale weight',
      'Buy signal when feed prices drop in your area',
      'Heat stress and cold warnings with the change to make',
    ],
    image: advisorImg,
    alt: 'AI advisor alerts screen',
  },
]

const MODULES = [
  { icon: Layers, title: 'Batch Tracking', desc: 'Open a batch the day chicks arrive and follow it to sale, with every cost and event logged against it.', wide: true, mini: [{ n: 'FCR', l: 'Feed conversion' }, { n: '100%', l: 'Cost traced' }] },
  { icon: HeartPulse, amber: true, title: 'Mortality Log', desc: 'Record deaths with cause and date. Survival rate is worked out for you.' },
  { icon: BarChart3, title: 'Profit & Loss', desc: 'Revenue minus real cost, updated the moment you log anything.' },
  { icon: Home, amber: true, title: 'Housing', desc: 'Coops, brooders and layer houses, with capacity and which batch sits where.' },
  { icon: Wrench, title: 'Equipment Register', desc: 'Every incubator, feeder and drinker bought, with cost, date and maintenance due.', wide: true, mini: [{ n: 'Live', l: 'Asset list' }, { n: 'Auto', l: 'Maintenance due' }] },
  { icon: TrendingUp, amber: true, title: 'AI Buy & Sell Advisor', desc: 'Tells you when a batch is ready to sell and when inputs are worth buying ahead of time.' },
  { icon: Users, title: 'Buyer Ledger', desc: 'Every buyer, what they took, what they paid and what they still owe.' },
  { icon: Wheat, amber: true, title: 'Feed Consumption', desc: 'Daily feed logged by batch, turned into cost per kilo and feed conversion ratio.' },
  { icon: Syringe, title: 'Medicine & Vaccination', desc: 'Dosage history, vaccination schedule and stock levels for every medicine.' },
  { icon: Thermometer, amber: true, title: 'Temperature Advice', desc: 'Heat stress and cold-snap warnings for your location, with the change to make.' },
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
    const nav = document.getElementById('siteNav')
    const handler = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 30) }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// ── PAGE ──────────────────────────────────────────────────────
const Features = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  useScrollReveal()
  useNavScroll()

  useEffect(() => {
    document.body.classList.add('light-bg')
    return () => document.body.classList.remove('light-bg')
  }, [])

  return (
    <div className="site-theme">
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
        onNavigate={() => setMenuOpen(false)}
        authLinks={[
          { to: '/login', label: 'Sign in' },
          { to: '/register', label: 'Get Started →' },
        ]}
      />

      <main>
        {/* HERO */}
        <section className="ft-hero">
          <div className="reveal">
            <div className="lg-eyebrow"><span className="lg-eyebrow-dot" />Features</div>
            <h1 className="lg-h1">
              Everything your flock needs, <em>in one ledger.</em>
            </h1>
            <p className="lg-desc">
              Ten modules for kienyeji, broilers and layers. Each one writes to the
              same record, so nothing gets tracked twice.
            </p>
            <div className="lg-cta-row" style={{ marginBottom: 0 }}>
              <Link to="/register" className="lg-btn-primary">Start free today →</Link>
              <a href="#modules" className="lg-btn-secondary">See all modules</a>
            </div>
          </div>
        </section>

        {/* SPOTLIGHTS */}
        {SPOTLIGHTS.map((s, i) => (
          <section className={`lg-section ft-spot${i % 2 === 0 ? ' ft-white' : ''}`} key={s.tag}>
            <div className={`ft-row${i % 2 === 1 ? ' flip' : ''}`}>
              <div className="ft-img reveal">
                <img src={s.image} alt={s.alt} />
              </div>
              <div className="ft-text reveal reveal-d1">
                <div className="lg-eyebrow-plain">{s.tag}</div>
                <h2 className="lg-title">{s.title}</h2>
                <p className="lg-sub">{s.desc}</p>
                <ul className="ft-points">
                  {s.points.map(p => (
                    <li key={p}>
                      <span className="ft-tick"><Check size={14} strokeWidth={2.5} /></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* ALL MODULES */}
        <section className="lg-section" id="modules">
          <div className="lg-section-head reveal">
            <div>
              <div className="lg-eyebrow-plain">All modules</div>
              <h2 className="lg-title">Ten modules.<br /><span className="accent">One farm record.</span></h2>
            </div>
            <p className="lg-sub">
              From the day a chick arrives to the shilling a buyer pays you,
              every module feeds the same ledger.
            </p>
          </div>
          <div className="lg-feature-grid reveal">
            {MODULES.map(m => {
              const Icon = m.icon
              return (
                <div className={`lg-feature${m.wide ? ' span2' : ''}`} key={m.title}>
                  <div className="lg-feature-top">
                    <div className={`lg-feature-icon ${m.amber ? 'amber' : ''}`}><Icon size={18} strokeWidth={1.8} /></div>
                  </div>
                  <div className="lg-feature-title">{m.title}</div>
                  <p className="lg-feature-desc">{m.desc}</p>
                  {m.mini && (
                    <div className="lg-feature-mini">
                      {m.mini.map(x => (
                        <div key={x.l}>
                          <div className="lg-feature-mini-num">{x.n}</div>
                          <div className="lg-feature-mini-label">{x.l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* CTA */}
      <section className="lg-cta">
        <div className="lg-cta-inner reveal">
          <div className="lg-cta-eyebrow">Start today. It's free</div>
          <h2 className="lg-cta-title">Your farm deserves <span className="amber">real numbers.</span></h2>
          <p className="lg-cta-sub">
            Open your first batch in minutes and watch your profit update as you log.
          </p>
          <div className="lg-cta-actions">
            <Link to="/register" className="lg-btn-cta">Create free account →</Link>
            <Link to="/login" className="lg-btn-cta-ghost">Sign in</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lg-footer">
        <div className="lg-footer-top">
          <div>
            <div className="lg-footer-brand">ChakFarm</div>
            <p className="lg-footer-desc">Farm intelligence for the modern African farmer. Built in Nairobi, Kenya.</p>
          </div>
          <div>
            <div className="lg-footer-head">Platform</div>
            <ul className="lg-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/register">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <div className="lg-footer-head">Legal</div>
            <ul className="lg-footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <div className="lg-footer-head">Contact</div>
            <ul className="lg-footer-links">
              <li><a href="mailto:hello@chakfarm.co.ke">hello@chakfarm.co.ke</a></li>
              <li><a href="#">Nairobi, Kenya</a></li>
            </ul>
          </div>
        </div>
        <div className="lg-footer-bottom">
          <span>© 2026 ChakFarm. Built in Nairobi.</span>
          <span>Kenya Data Protection Act 2019 compliant</span>
        </div>
      </footer>
    </div>
  )
}

export default Features