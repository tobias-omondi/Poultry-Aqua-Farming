import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'   // shared colours, buttons, CTA and footer
import './Financials.css'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import { NAV_LINKS } from './navLinks'
import { Check, Egg, Wheat, Syringe, Users, Wrench, HeartPulse } from 'lucide-react'
import overviewImg from '/src/assets/overviewpage.png'   // screenshot of your profit / overview page

// ── CONTENT — edit freely ─────────────────────────────────────
const COSTS = [
  { icon: Egg, title: 'Chicks', desc: 'What you paid for the birds, counted against the batch they came in.' },
  { icon: Wheat, title: 'Feed', desc: 'Daily feed logged by batch and turned into cost per bird and feed conversion.' },
  { icon: Syringe, title: 'Medicine and vaccines', desc: 'Every dose and vaccination charged to the flock that received it.' },
  { icon: Users, title: 'Labour and utilities', desc: 'Wages, water, power and litter shared across the batches that used them.' },
  { icon: Wrench, title: 'Equipment', desc: 'Feeders, drinkers and heaters spread across their useful life, not hidden.' },
  { icon: HeartPulse, title: 'Losses', desc: 'Birds that die are recorded with a cause, so you see what mortality costs.' },
]

const POINTS = [
  'Revenue minus cost for every batch, not one farm-wide total',
  'Cost per bird worked out from your daily logs',
  'Profit updates the moment you log a sale or a purchase',
  'Buyer ledger shows who has paid and who still owes',
]

const DEFAULTS = {
  birds: 100, chickPrice: 130, feedPerBird: 380, medPerBird: 40,
  other: 2500, mortality: 5, sellPrice: 750,
}

const FIELDS = [
  { name: 'birds', label: 'Chicks bought', suffix: 'birds' },
  { name: 'chickPrice', label: 'Price per chick', suffix: 'KSh' },
  { name: 'feedPerBird', label: 'Feed cost per bird', suffix: 'KSh' },
  { name: 'medPerBird', label: 'Medicine and vaccines per bird', suffix: 'KSh' },
  { name: 'other', label: 'Other costs for the batch', suffix: 'KSh' },
  { name: 'mortality', label: 'Expected deaths', suffix: '%' },
  { name: 'sellPrice', label: 'Selling price per bird', suffix: 'KSh' },
]

const num = v => Number(v) || 0
const fmt = n => Math.round(n).toLocaleString('en-KE')

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
const Financials = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [calc, setCalc] = useState(DEFAULTS)
  useScrollReveal()
  useNavScroll()

  useEffect(() => {
    document.body.classList.add('light-bg')
    return () => document.body.classList.remove('light-bg')
  }, [])

  const setField = e => setCalc({ ...calc, [e.target.name]: e.target.value })

  // The maths: everything below is worked out again each time a box changes
  const birds = num(calc.birds)
  const deathRate = Math.min(100, Math.max(0, num(calc.mortality)))
  const sold = Math.round(birds * (1 - deathRate / 100))
  const revenue = sold * num(calc.sellPrice)
  const parts = [
    { label: 'Chicks', value: birds * num(calc.chickPrice), cls: 'c1' },
    { label: 'Feed', value: birds * num(calc.feedPerBird), cls: 'c2' },
    { label: 'Medicine', value: birds * num(calc.medPerBird), cls: 'c3' },
    { label: 'Other', value: num(calc.other), cls: 'c4' },
  ]
  const cost = parts.reduce((sum, p) => sum + p.value, 0)
  const profit = revenue - cost
  const perBird = sold ? profit / sold : 0
  const breakEven = sold ? cost / sold : 0

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
        <section className="fn-hero">
          <div className="reveal">
            <div className="lg-eyebrow"><span className="lg-eyebrow-dot" />Financials</div>
            <h1 className="lg-h1">
              Most farmers know their sales. <em>Few know their profit.</em>
            </h1>
            <p className="lg-desc">
              ChakFarm puts every cost and every sale against the batch it belongs
              to, so you see what each flock really earned.
            </p>
            <div className="lg-cta-row" style={{ marginBottom: 0 }}>
              <Link to="/register" className="lg-btn-primary">See your numbers →</Link>
              <a href="#calculator" className="lg-btn-secondary">Try the calculator</a>
            </div>
          </div>
        </section>

        {/* CALCULATOR */}
        <section className="lg-section fn-white" id="calculator">
          <div className="lg-section-head reveal">
            <div>
              <div className="lg-eyebrow-plain">Try it</div>
              <h2 className="lg-title">Work out a batch<br /><span className="green">in 30 seconds.</span></h2>
            </div>
            <p className="lg-sub">
              Change the numbers to match your own birds. The figures start as an
              example only, so replace them with your real prices.
            </p>
          </div>

          <div className="fn-calc reveal">
            <div className="fn-inputs">
              {FIELDS.map(f => (
                <label className="fn-field" key={f.name}>
                  <span>{f.label}</span>
                  <div className="fn-input">
                    <input
                      name={f.name}
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={calc[f.name]}
                      onChange={setField}
                    />
                    <em>{f.suffix}</em>
                  </div>
                </label>
              ))}
              <button type="button" className="fn-reset" onClick={() => setCalc(DEFAULTS)}>
                Reset to example
              </button>
            </div>

            <div className="fn-result">
              <div className="fn-result-label">Estimated profit for this batch</div>
              <div className={`fn-result-profit ${profit >= 0 ? 'pos' : 'neg'}`}>
                {profit < 0 ? '-' : ''}KSh {fmt(Math.abs(profit))}
              </div>
              <div className="fn-stats">
                <div><span>Birds sold</span><strong>{fmt(sold)}</strong></div>
                <div><span>Revenue</span><strong>KSh {fmt(revenue)}</strong></div>
                <div><span>Total cost</span><strong>KSh {fmt(cost)}</strong></div>
                <div><span>Profit per bird</span><strong>KSh {fmt(perBird)}</strong></div>
                <div className="wide"><span>Break-even price per bird</span><strong>KSh {fmt(breakEven)}</strong></div>
              </div>

              <div className="fn-split-label">Where the money goes</div>
              <div className="fn-bar">
                {parts.map(p => (
                  <span key={p.label} className={p.cls} style={{ width: cost ? `${(p.value / cost) * 100}%` : '0%' }} />
                ))}
              </div>
              <ul className="fn-legend">
                {parts.map(p => (
                  <li key={p.label}>
                    <i className={p.cls} />
                    {p.label}
                    <b>{cost ? Math.round((p.value / cost) * 100) : 0}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SCREENSHOT SPLIT */}
        <section className="lg-section">
          <div className="fn-split">
            <div className="fn-shot reveal">
              <img src={overviewImg} alt="ChakFarm profit overview screen" />
            </div>
            <div className="reveal reveal-d1">
              <div className="lg-eyebrow-plain">In the app</div>
              <h2 className="lg-title">Your real profit, <span className="accent">always current.</span></h2>
              <p className="lg-sub" style={{ margin: '18px 0 26px', maxWidth: 480 }}>
                The calculator guesses ahead. ChakFarm uses what you actually logged,
                so the number you see is the number you earned.
              </p>
              <ul className="fn-points">
                {POINTS.map(p => (
                  <li key={p}>
                    <span className="fn-tick"><Check size={14} strokeWidth={2.5} /></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* COST CATEGORIES */}
        <section className="lg-section fn-white">
          <div className="lg-section-head reveal">
            <div>
              <div className="lg-eyebrow-plain">Cost tracking</div>
              <h2 className="lg-title">Every cost<br /><span className="green">has a home.</span></h2>
            </div>
            <p className="lg-sub">
              When each cost is recorded where it belongs, you can see exactly what to
              fix to earn more from the next batch.
            </p>
          </div>
          <div className="fn-costs reveal">
            {COSTS.map(c => {
              const Icon = c.icon
              return (
                <div className="fn-cost" key={c.title}>
                  <div className="fn-cost-icon"><Icon size={20} strokeWidth={1.8} /></div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
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
              <li><Link to="/features">Features</Link></li>
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

export default Financials