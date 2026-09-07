import React, { useEffect, useState } from 'react'
import './LandingPage.css'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import {
  Layers, HeartPulse, BarChart3, Home, Wrench, TrendingUp,
  Users, Wheat, Syringe, Thermometer, Egg, Leaf, Beef,
} from 'lucide-react'
import chicken from "/src/assets/chicken.jpg"
import goat from "/src/assets/goat.jpg"
import cow from "/src/assets/cow.jpg"

// ── DATA ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: '#species', label: 'Species' },
  { href: '#features', label: 'Features' },
  { href: '#financials', label: 'Financials' },
  { href: '#advisor', label: 'AI Advisor' },
  { href: '#buyers', label: 'Buyers' },
]

const SPECIES = [
  {
    code: 'SP-01 / POULTRY',
    image: chicken,
    name: 'Kienyeji & Broiler',
    breeds: 'Kari Improved, Rainbow Rooster, Kenbro, Local Indigenous',
    metricLabel: 'Tracked on',
    metricValue: 'FCR & mortality',
  },
  {
    code: 'SP-02 / GOATS',
    image: goat,
    name: 'Meat & Dairy Goats',
    breeds: 'Boer, Galla, Toggenburg, Small East African',
    metricLabel: 'Tracked on',
    metricValue: 'Weight & breeding',
  },
  {
    code: 'SP-03 / CATTLE',
    image: cow,
    name: 'Beef & Dairy Cattle',
    breeds: 'Friesian, Ayrshire, Boran, Zebu',
    metricLabel: 'Tracked on',
    metricValue: 'Milk yield & health',
  },
]

const FEATURES = [
  {
    no: '01', icon: Layers, iconClass: '', title: 'Batch Tracking',
    desc: 'Open a batch the day animals arrive and follow it to sale. Every cost and event logged against that batch, not the whole farm.',
    wide: true, mini: [{ n: 'FCR', l: 'Feed conversion' }, { n: '100%', l: 'Cost traced' }],
  },
  {
    no: '02', icon: HeartPulse, iconClass: 'amber', title: 'Mortality Log',
    desc: 'Record deaths with cause and date. Survival rate calculated automatically per batch and species.',
  },
  {
    no: '03', icon: BarChart3, iconClass: '', title: 'Profit & Loss',
    desc: 'Revenue minus real cost, updated the moment you log a sale or a purchase — not an end-of-month guess.',
  },
  {
    no: '04', icon: Home, iconClass: 'amber', title: 'Housing',
    desc: 'Coops, pens, and sheds with capacity, occupancy, and which batch sits where.',
  },
  {
    no: '05', icon: Wrench, iconClass: '', title: 'Equipment Register',
    desc: 'Every incubator, feeder, and water pump bought — cost, purchase date, and maintenance due.',
    wide: true, mini: [{ n: 'Live', l: 'Asset list' }, { n: 'Auto', l: 'Maintenance due' }],
  },
  {
    no: '06', icon: TrendingUp, iconClass: 'amber', title: 'AI Buy & Sell Advisor',
    desc: 'Tells you when a batch has hit optimal sale weight, and when input prices in your area are worth buying ahead of.',
  },
  {
    no: '07', icon: Users, iconClass: '', title: 'Buyer Ledger',
    desc: 'Every buyer who has bought from your shop — what they bought, how much they paid, and what they still owe.',
  },
  {
    no: '08', icon: Wheat, iconClass: 'amber', title: 'Feed Consumption',
    desc: 'Daily feed logged by batch, converted to cost per kilo and feed conversion ratio automatically.',
  },
  {
    no: '09', icon: Syringe, iconClass: '', title: 'Medicine & Vaccination',
    desc: 'Dosage history, vaccination schedule, and stock levels for every medicine on the farm.',
  },
  {
    no: '10', icon: Thermometer, iconClass: 'amber', title: 'Temperature Advice',
    desc: 'Heat stress and cold-snap warnings for your location, with the ventilation or brooding change to make.',
  },
]

const FIN_ROWS = [
  { name: 'Batch #3 — Broiler', sub: 'Kenbro · 240 birds', rev: '48,200', cost: '29,800', profit: '+18,400', posProfit: true },
  { name: 'Batch #2 — Kienyeji', sub: 'Closed · 180 birds', rev: '21,000', cost: '11,800', profit: '+9,200', posProfit: true },
  { name: 'Boer Herd', sub: 'Goats · 12 head', rev: '18,600', cost: '11,800', profit: '+6,800', posProfit: true },
  { name: 'Batch #1 — Kienyeji', sub: 'Closed · 150 birds', rev: '14,400', cost: '15,900', profit: '-1,500', posProfit: false },
]

const ALERTS = [
  { icon: TrendingUp, tag: 'Sell signal', title: 'Batch #3 has hit optimal sale weight', desc: 'Kenbro birds averaging 1.9kg at 42 days — market price in your area is up 6% this week.', cls: '' },
  { icon: BarChart3, tag: 'Buy signal', title: 'Maize bran prices trending down', desc: 'Layer mash inputs are 8% cheaper than last month near you. Worth restocking before the next batch.', cls: 'warn' },
  { icon: Thermometer, tag: 'Temperature advice', title: 'Heat stress risk this week', desc: 'Daytime highs above 29°C forecast for your coop location — increase ventilation and check water supply twice daily.', cls: 'temp' },
]

const BUYERS = [
  { name: 'Grace Wanjiru', loc: 'Kiambu Market', item: '40 broilers', amt: '9,600', status: 'paid' },
  { name: 'Peter Otieno', loc: 'Ruiru', item: '2 Boer goats', amt: '24,000', status: 'paid' },
  { name: 'Mama Fatuma', loc: 'Mombasa Rd', item: 'Eggs, 30 trays', amt: '5,400', status: 'pending' },
  { name: 'Samuel Kiprop', loc: 'Nakuru', item: 'Dairy milk, 60L', amt: '3,300', status: 'paid' },
]

const TESTIMONIALS = [
  {
    quote: '"I used to lose track of which batch was actually profitable. Now the mortality log and the P&L sit side by side — I know before I get to market."',
    name: 'James Mwangi', role: 'Broiler Farmer · Kiambu', initials: 'JM',
  },
  {
    quote: '"The temperature advice caught a heat spell before I noticed it myself. The buyer ledger means no one forgets what they owe me anymore."',
    name: 'Amina Hassan', role: 'Kienyeji Farmer · Mombasa', initials: 'AH',
  },
  {
    quote: '"Feed consumption tracking showed me exactly where the bran was going. Equipment records made it easy to prove my assets for a loan."',
    name: 'Daniel Kiptoo', role: 'Mixed Farmer · Nakuru', initials: 'DK',
  },
]

const TICKER_ITEMS = [
  'Batch Tracking', 'Mortality Log', 'Profit & Loss', 'Housing', 'Equipment',
  'AI Buy & Sell Advisor', 'Buyer Ledger', 'Feed Consumption', 'Medicine & Vaccination', 'Temperature Advice',
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

// ── SUB-COMPONENTS ────────────────────────────────────────────
function Hero() {
  return (
    <section className="lg-hero">
      <div className="lg-hero-left reveal">
        <div className="lg-eyebrow"><span className="lg-eyebrow-dot" />Farm Ledger, Live</div>
        <h1 className="lg-h1">
          Every batch. Every shilling. <em>One ledger.</em>
        </h1>
        <p className="lg-desc">
          ChakFarm logs mortality, feed, medicine, and equipment against every
          batch of chickens, goats, and cattle you run — then turns it into a
          real profit and loss, buyer records, and AI advice on when to buy,
          sell, and adjust for weather.
        </p>
        <div className="lg-cta-row">
          <a href="/register" className="lg-btn-primary">Start free today →</a>
          <a href="#features" className="lg-btn-secondary">See how it works</a>
        </div>
        <div className="lg-stat-strip">
          <div className="lg-stat"><div className="lg-stat-num">3</div><div className="lg-stat-label">Species tracked</div></div>
          <div className="lg-stat"><div className="lg-stat-num">10</div><div className="lg-stat-label">Farm modules</div></div>
          <div className="lg-stat"><div className="lg-stat-num">Live</div><div className="lg-stat-label">P&L updates</div></div>
        </div>
      </div>
      <div className="lg-hero-right reveal reveal-d2">
        <div className="lg-ledger">
          <div className="lg-ledger-bar">
            <div className="lg-ledger-dot" style={{ background: '#ff5f56' }} />
            <div className="lg-ledger-dot" style={{ background: '#ffbd2e' }} />
            <div className="lg-ledger-dot" style={{ background: '#28ca41' }} />
            <span className="lg-ledger-path">chakfarm.co.ke/ledger</span>
          </div>
          <div className="lg-ledger-head">
            <span>#</span><span>Batch</span><span style={{ textAlign: 'right' }}>Profit</span><span style={{ textAlign: 'right' }}>Status</span>
          </div>
          {FIN_ROWS.map((row, i) => (
            <div className="lg-ledger-row" key={row.name}>
              <span className="lg-rowno">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <div className="lg-ledger-name">{row.name}</div>
                <div className="lg-ledger-sub">{row.sub}</div>
              </span>
              <span className={`lg-ledger-figure ${row.posProfit ? 'pos' : 'neg'}`}>{row.profit}</span>
              <span className={`lg-ledger-badge ${i === 0 || i === 2 ? 'active' : 'closed'}`}>
                {i === 0 || i === 2 ? 'active' : 'closed'}
              </span>
            </div>
          ))}
          <div className="lg-ledger-cursor">
            <span className="lg-cursor-blink" />
            calculating live profit…
          </div>
        </div>
      </div>
    </section>
  )
}
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="lg-ticker">
      <div className="lg-ticker-track">
        {doubled.map((item, i) => <div className="lg-ticker-item" key={i}>{item}</div>)}
      </div>
    </div>
  )
}
function SpeciesSection() {
  return (
    <section className="lg-section" id="species">
      <div className="lg-section-head reveal">
        <div>
          <div className="lg-eyebrow-plain">What we track</div>
          <h2 className="lg-title">Every animal.<br /><span className="green">Every breed.</span></h2>
        </div>
        <p className="lg-sub">
          Built for Kenya's livestock sector — poultry, goats, and cattle,
          each with breed-aware cost models and the metrics that actually
          decide profitability.
        </p>
      </div>
      <div className="lg-species-grid reveal">
        {SPECIES.map(sp => (
          <div className="lg-species-card" key={sp.name}>
            <div className="lg-species-code">{sp.code}</div>
            <div className="lg-species-img-wrap">
              <img src={sp.image} alt={sp.name} className="lg-species-img" />
            </div>
            <div className="lg-species-name">{sp.name}</div>
            <div className="lg-species-breeds">{sp.breeds}</div>
            <div className="lg-species-metric">
              <span>{sp.metricLabel}</span>
              <span>{sp.metricValue}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
function Features() {
  return (
    <section className="lg-section" id="features">
      <div className="lg-section-head reveal">
        <div>
          <div className="lg-eyebrow-plain">Platform modules</div>
          <h2 className="lg-title">Ten modules.<br /><span className="accent">One farm record.</span></h2>
        </div>
        <p className="lg-sub">
          From the day an animal arrives to the shilling a buyer pays you —
          every module writes to the same ledger, so nothing gets tracked twice.
        </p>
      </div>
      <div className="lg-feature-grid reveal">
        {FEATURES.map(f => {
          const Icon = f.icon
          return (
            <div className={`lg-feature${f.wide ? ' span2' : ''}`} key={f.title}>
              <div className="lg-feature-top">
                <div className={`lg-feature-icon ${f.iconClass}`}><Icon size={18} strokeWidth={1.8} /></div>
                <div className="lg-feature-no">{f.no}</div>
              </div>
              <div className="lg-feature-title">{f.title}</div>
              <p className="lg-feature-desc">{f.desc}</p>
              {f.mini && (
                <div className="lg-feature-mini">
                  {f.mini.map(m => (
                    <div key={m.l}>
                      <div className="lg-feature-mini-num">{m.n}</div>
                      <div className="lg-feature-mini-label">{m.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
function Financials() {
  return (
    <section className="lg-section" id="financials">
      <div className="lg-eyebrow-plain reveal">Profitability engine</div>
      <h2 className="lg-title reveal" style={{ marginBottom: 40 }}>
        Stop guessing. <span className="green">Start knowing.</span>
      </h2>
      <div className="lg-fin-split">
        <div className="lg-fin-left reveal">
          <p className="lg-sub" style={{ marginBottom: 0 }}>
            Most farmers know their revenue. Few know their real profit.
            ChakFarm separates every cost category so you know exactly where
            the money goes — per batch, per bird, per season.
          </p>
          <div className="lg-fin-checks">
            {[
              'Revenue minus cost per batch, not just total farm revenue',
              'Cost per bird or per head calculated from your daily logs',
              'Feed and medicine spend attributed to the batch that used it',
              'Running P&L updates the moment you log anything',
              'Equipment depreciation factored into true batch cost',
            ].map((c, i) => (
              <div className="lg-fin-check" key={c}>
                <span className="lg-fin-check-no">{String(i + 1).padStart(2, '0')}</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
          <a href="/register" className="lg-btn-primary">See your numbers →</a>
        </div>
        <div className="lg-fin-right reveal reveal-d1">
          <div className="lg-fin-table-head">
            <span>Batch</span><span style={{ textAlign: 'right' }}>Revenue</span><span style={{ textAlign: 'right' }}>Cost</span><span style={{ textAlign: 'right' }}>Profit</span>
          </div>
          {FIN_ROWS.map(row => (
            <div className="lg-fin-table-row" key={row.name}>
              <span>
                <div className="lg-fin-row-name">{row.name}</div>
                <div className="lg-fin-row-sub">{row.sub}</div>
              </span>
              <span className="lg-fin-cell">{row.rev}</span>
              <span className="lg-fin-cell">{row.cost}</span>
              <span className={`lg-fin-cell ${row.posProfit ? 'pos' : 'neg'}`}>{row.profit}</span>
            </div>
          ))}
          <div className="lg-fin-totals">
            <span>Totals — May 2026</span>
            <span style={{ textAlign: 'right' }}>102,200</span>
            <span style={{ textAlign: 'right' }}>69,300</span>
            <span style={{ textAlign: 'right', color: 'var(--sage-deep)' }}>32,900</span>
          </div>
        </div>
      </div>
    </section>
  )
}
function AIAdvisor() {
  return (
    <section className="lg-section" id="advisor">
      <div className="lg-eyebrow-plain reveal">AI on the farm</div>
      <h2 className="lg-title reveal" style={{ marginBottom: 40 }}>
        Know when to buy. <span className="accent">Know when to sell.</span>
      </h2>
      <div className="lg-ai">
        <div className="lg-ai-left reveal">
          <p className="lg-sub" style={{ marginBottom: 24 }}>
            The advisor reads your live batch data, local input prices, and
            forecast conditions for your coop or shed location — then tells
            you the three things that actually move profit: when a batch is
            ready to sell, when inputs are worth buying ahead of, and when
            the weather itself is the risk.
          </p>
          <a href="/register" className="lg-btn-secondary">Ask the advisor →</a>
        </div>
        <div className="lg-ai-right reveal reveal-d1">
          {ALERTS.map(a => {
            const Icon = a.icon
            return (
              <div className="lg-alert" key={a.title}>
                <div className={`lg-alert-icon ${a.cls}`}><Icon size={16} strokeWidth={1.8} /></div>
                <div>
                  <div className="lg-alert-tag">{a.tag}</div>
                  <div className="lg-alert-title">{a.title}</div>
                  <div className="lg-alert-desc">{a.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
function Buyers() {
  return (
    <section className="lg-section" id="buyers">
      <div className="lg-section-head reveal">
        <div>
          <div className="lg-eyebrow-plain">Shop ledger</div>
          <h2 className="lg-title">Who bought<br /><span className="green">from you.</span></h2>
        </div>
        <p className="lg-sub">
          Every sale from your shop, logged against the buyer — what they
          took, what they paid, and what's still outstanding.
        </p>
      </div>
      <div className="lg-buyers-table reveal">
        <div className="lg-buyers-head">
          <span>#</span><span>Buyer</span><span>Location</span><span>Item</span><span style={{ textAlign: 'right' }}>Amount</span><span>Status</span>
        </div>
        {BUYERS.map((b, i) => (
          <div className="lg-buyers-row" key={b.name}>
            <span className="lg-rowno">{String(i + 1).padStart(2, '0')}</span>
            <span className="lg-buyer-name">{b.name}</span>
            <span className="lg-buyer-loc">{b.loc}</span>
            <span>{b.item}</span>
            <span className="lg-buyer-amt">KSh {b.amt}</span>
            <span className={`lg-buyer-status ${b.status}`}>{b.status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
function Testimonials() {
  return (
    <section className="lg-section" id="testimonials">
      <div className="lg-section-head reveal">
        <div>
          <div className="lg-eyebrow-plain">Farmer stories</div>
          <h2 className="lg-title">Trusted across<br /><span className="green">Kenya.</span></h2>
        </div>
        <p className="lg-sub">
          From broiler farmers in Kiambu to mixed operations in Nakuru —
          real results from real farms.
        </p>
      </div>
      <div className="lg-testi-grid reveal">
        {TESTIMONIALS.map(t => (
          <div className="lg-testi" key={t.name}>
            <div className="lg-testi-mark">"</div>
            <p className="lg-testi-quote">{t.quote}</p>
            <div className="lg-testi-author">
              <div className="lg-testi-avatar">{t.initials}</div>
              <div>
                <div className="lg-testi-name">{t.name}</div>
                <div className="lg-testi-role">{t.role}</div>
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
    <section className="lg-cta">
      <div className="lg-cta-inner reveal">
        <div className="lg-cta-eyebrow">Start today — it's free</div>
        <h2 className="lg-cta-title">Your farm deserves <span className="amber">real numbers.</span></h2>
        <p className="lg-cta-sub">
          Join farmers across Kenya replacing notebooks and guesswork with a
          live ledger, AI advice, and buyer records that open funding doors.
        </p>
        <div className="lg-cta-actions">
          <a href="/register" className="lg-btn-cta">Create free account →</a>
          <a href="/login" className="lg-btn-cta-ghost">Sign in</a>
        </div>
      </div>
    </section>
  )
}
function Footer({ onCookieSettings }) {
  return (
    <footer className="lg-footer">
      <div className="lg-footer-top">
        <div>
          <div className="lg-footer-brand">ChakFarm</div>
          <p className="lg-footer-desc">
            Farm intelligence for the modern African farmer.
            Built in Nairobi, Kenya.
          </p>
        </div>
        <div>
          <div className="lg-footer-head">Platform</div>
          <ul className="lg-footer-links">
            <li><a href="#species">Species</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#financials">Financials</a></li>
            <li><a href="/register">Get Started</a></li>
          </ul>
        </div>
        <div>
          <div className="lg-footer-head">Legal</div>
          <ul className="lg-footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onCookieSettings() }}>Cookie Settings</a></li>
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
  )
}
function CookieBanner({ visible, onAccept, onEssential, onClose }) {
  return (
    <div className={`lg-cookie${visible ? ' show' : ''}`}>
      <div className="lg-cookie-inner">
        <div className="lg-cookie-copy">
          <div className="lg-cookie-title">We use cookies on ChakFarm</div>
          <div className="lg-cookie-desc">
            Essential cookies keep you logged in. Analytics cookies help us
            improve the platform. <a href="#">Learn more</a> · Kenya Data
            Protection Act 2019.
          </div>
        </div>
        <div className="lg-cookie-btns">
          <button className="lg-cb-essential" onClick={onEssential}>Essential only</button>
          <button className="lg-cb-accept" onClick={onAccept}>Accept all</button>
        </div>
        <button className="lg-cb-close" onClick={onClose} aria-label="Close">×</button>
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

  useEffect(() => {
    const saved = localStorage.getItem('chakfarm-cookies')
    if (!saved) {
      const timer = setTimeout(() => setCookieVisible(true), 1400)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = async (consent) => {
    localStorage.setItem('chakfarm-cookies', consent)
    setCookieVisible(false)
    try {
      await fetch('/api/auth/cookies/consent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ consent }),
      })
    } catch {
      // saved locally
    }
  }
  const handleCookieSettings = () => {
    localStorage.removeItem('chakfarm-cookies')
    setCookieVisible(true)
  }

  return (
    <>
      <Navbar
        links={NAV_LINKS}
        actions={
          <>
            <a href="/login" className="site-btn-ghost">Sign in</a>
            <a href="/register" className="site-btn-solid">Get Started</a>
          </>
        }
        onHamburger={() => setMenuOpen(o => !o)}
      />
      <MobileMenu
        open={menuOpen}
        links={NAV_LINKS}
        authLinks={[
          { to: '/login', label: 'Sign in' },
          { to: '/register', label: 'Get Started →' },
        ]}
      />
      <main>
        <Hero />
        <Ticker />
        <SpeciesSection />
        <Features />
        <Financials />
        <AIAdvisor />
        <Buyers />
        <Testimonials />
      </main>
      <CTA />
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