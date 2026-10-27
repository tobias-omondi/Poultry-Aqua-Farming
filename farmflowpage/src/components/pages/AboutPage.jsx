import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'   // shared colours, buttons, CTA and footer styles
import './About.css'
import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import { NAV_LINKS } from './navLinks'
import { Target, MapPin, Smartphone, ShieldCheck } from 'lucide-react'

// ── FAKE IMAGE IMPORTS ────────────────────────────────────────
// Put your real photos at these paths (or change the paths below).
import heroImg from '/src/assets/chicken coop.jpg'       // wide shot of your coop / flock (21:9 works best)
import storyImg from '/src/assets/farmer.jpg'     // portrait photo, e.g. you feeding the birds (4:5)
import founderImg from '/src/assets/founder.jpeg' // square photo of you (1:1)

// ── CONTENT — edit all of this text to your own words ─────────
const VALUES = [
  { icon: Target, title: 'Real numbers, not guesses', desc: 'Every cost and every sale logged against the batch it belongs to, so you know what actually made money.' },
  { icon: MapPin, title: 'Built for Kenya', desc: 'Kenyan breeds, shillings, local feed prices and the weather your birds really live in.' },
  { icon: Smartphone, title: 'Simple enough for the coop', desc: 'If it takes longer than writing in a notebook, we got it wrong. Quick to log, easy to read.' },
  { icon: ShieldCheck, title: 'Your data stays yours', desc: 'Each farmer sees only their own records, and nobody else can open them.' },
]

const FLOCKS = ['Improved Kienyeji', 'Indigenous Kienyeji', 'Broilers', 'Layers']

const ROADMAP = [
  { status: 'Live', title: 'Poultry ledger', desc: 'Batches, mortality, feed, medicine, equipment, buyers and live profit and loss for every flock type.' },
  { status: 'Next', title: 'Goats', desc: 'Breeding records, weights and kidding, with the same per-animal costs and profit tracking.' },
  { status: 'Later', title: 'Smarter advice', desc: 'Deeper AI advice on when to buy, sell and adjust, as more farm data comes in.' },
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
const AboutPage = () => {
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
        <section className="ab-hero">
          <div className="ab-hero-text reveal">
            <div className="lg-eyebrow"><span className="lg-eyebrow-dot" />About ChakFarm</div>
            <h1 className="lg-h1">
              Farming runs on numbers. <em>We make them easy to see.</em>
            </h1>
            <p className="lg-desc">
              ChakFarm is a farm ledger for Kenyan poultry farmers. It turns daily
              feed, deaths, sales and costs into a clear picture of what each batch
              really earns.
            </p>
          </div>
          <div className="ab-hero-img reveal reveal-d1">
            <img src={heroImg} alt="Chickens at a Kenyan farm" />
          </div>
        </section>

        {/* STORY */}
        <section className="lg-section ab-white">
          <div className="ab-story">
            <div className="ab-story-img reveal">
              <img src={storyImg} alt="Feeding the birds at the farm" />
            </div>
            <div className="ab-story-text reveal reveal-d1">
              <div className="lg-eyebrow-plain">Our story</div>
              <h2 className="lg-title">Notebooks lose money <span className="green">quietly.</span></h2>
              <p className="lg-sub">
                Too many farmers know their sales but not their profit. Feed, chicks,
                medicine and losses are scattered across notebooks and phone messages,
                so the real result only shows up at the end of the season, if at all.
              </p>
              <p className="lg-sub">
                ChakFarm started from that problem. We wanted one place where every
                cost and every sale is logged against the batch it belongs to, built
                around how Kenyan farms actually work.
              </p>
              <blockquote className="ab-quote">
                “A farm is a business. It deserves business records.”
              </blockquote>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="lg-section">
          <div className="lg-section-head reveal">
            <div>
              <div className="lg-eyebrow-plain">What we believe</div>
              <h2 className="lg-title">Four ideas behind<br /><span className="accent">everything we build.</span></h2>
            </div>
            <p className="lg-sub">
              These decide what goes into ChakFarm, and just as often, what stays out.
            </p>
          </div>
          <div className="ab-values reveal">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div className="ab-value" key={v.title}>
                  <div className="ab-value-icon"><Icon size={20} strokeWidth={1.8} /></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* FLOCKS BAND */}
        <section className="ab-band">
          <div className="ab-band-inner reveal">
            <h2 className="ab-band-title">Built around the birds you actually keep.</h2>
            <div className="ab-chips">
              {FLOCKS.map(f => <span className="ab-chip" key={f}>{f}</span>)}
            </div>
          </div>
        </section>

        {/* FOUNDER */}
        <section className="lg-section ab-white">
          <div className="ab-founder reveal">
            <img className="ab-founder-img" src={founderImg} alt="Founder of ChakFarm" />
            <div>
              <div className="lg-eyebrow-plain">Who is behind it</div>
              <h2 className="lg-title">Tobias Ogola</h2>
              <p className="ab-founder-role">Founder, ChakFarm</p>
              <p className="lg-sub">
                I'm a software engineer who decided to build a life in farming, starting
                with chickens. As soon as I began keeping birds, I wanted to know batch by
                batch what was making money and what was not, and I couldn't find a tool
                built for how Kenyan farms really work. So I built ChakFarm, first for my
                own flock and now for any poultry farmer who wants clear numbers instead
                of notebooks.
              </p>
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section className="lg-section" style={{ background: 'var(--off-white)' }}>
          <div className="lg-section-head reveal">
            <div>
              <div className="lg-eyebrow-plain">Where we are going</div>
              <h2 className="lg-title">Poultry first.<br /><span className="green">Then more.</span></h2>
            </div>
            <p className="lg-sub">
              We would rather do one thing properly than promise everything at once.
            </p>
          </div>
          <div className="ab-road reveal">
            {ROADMAP.map((r, i) => (
              <div className={`ab-road-card${i === 0 ? ' live' : ''}`} key={r.title}>
                <span className="ab-road-status">{r.status}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CTA */}
      <section className="lg-cta">
        <div className="lg-cta-inner reveal">
          <div className="lg-cta-eyebrow">Start today. It's free</div>
          <h2 className="lg-cta-title">See your farm in <span className="amber">real numbers.</span></h2>
          <p className="lg-cta-sub">
            Open a batch, log what happens, and watch your profit update as you go.
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

export default AboutPage