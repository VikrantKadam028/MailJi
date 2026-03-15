import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Mail, ArrowRight, Shield, Eye, Zap, Check, Star, Activity, Lock } from 'lucide-react'
import AboutSection from '../components/AboutSection.jsx'

/* ─── Demo emails ─── */
const DEMO_EMAILS = [
  { subject: 'Congratulations! You WON $10,000', sender: 'prize@lottery-win.com', spam: true, prob: 0.98, words: ['WON', 'PRIZE', 'CLAIM'] },
  { subject: 'Design review notes from Alex', sender: 'alex@studio.io', spam: false, prob: 0.02, words: [] },
  { subject: 'URGENT: Account needs verify!!', sender: 'security@phish.ru', spam: true, prob: 0.96, words: ['URGENT', 'VERIFY'] },
  { subject: 'Sprint planning — Tuesday 10am', sender: 'pm@company.co', spam: false, prob: 0.04, words: [] },
  { subject: 'FREE iPhone — Limited offer!!!', sender: 'offers@scam-deals.net', spam: true, prob: 0.97, words: ['FREE', 'LIMITED'] },
]

const FEATURES = [
  { icon: Shield, no: '01', title: 'Instant Detection, Ji', desc: 'Every email is analysed the moment it arrives. MailJi flags suspicious messages with a precise confidence score — koi cheez nahi chhutti.' },
  { icon: Eye, no: '02', title: 'See Why — Bilkul Clear', desc: 'No black boxes. MailJi highlights the exact words and patterns that triggered the verdict. Full transparency, zero guesswork.' },
  { icon: Zap, no: '03', title: 'Scan Any Range', desc: 'Choose exactly how many emails to scan — 10, 25, or 50 at a time. Page through at your own pace. Aapki marzi.' },
  { icon: Mail, no: '04', title: 'Gmail Native, Ekdum Easy', desc: 'One-click Google sign-in. Read-only access means MailJi never moves, deletes, or modifies a single email. Promise hai.' },
  { icon: Star, no: '05', title: '99.3% Accuracy, Sach Mein', desc: 'Trained on tens of thousands of real-world emails. Outperforms most enterprise-grade spam filters available today.' },
  { icon: Lock, no: '06', title: 'Zero Data Stored, Kabhi Nahi', desc: 'Your emails are never saved to any server. Everything is processed within your session and discarded when you leave.' },
]

const STEPS = [
  { n: '01', title: 'Namaste Gmail Ko', desc: 'One-click Google sign-in. Read-only access — we never modify or delete your emails. Scout\'s honour, Ji.' },
  { n: '02', title: 'Pick Your Range, Bhai', desc: 'Choose how many emails to scan. Browse your inbox at your own pace. Aapka inbox, aapka control.' },
  { n: '03', title: 'Read the Report', desc: 'Confidence scores and clear explanations for every flagged message, delivered instantly. Bas itna hi!' },
]

const STATS = [
  { value: '99.3%', label: 'Detection Accuracy' },
  { value: '< 1s', label: 'Analysis Speed' },
  { value: '0', label: 'Emails Stored' },
  { value: '1-Click', label: 'Gmail Setup' },
]

const COMPARE = [
  ['Spam Detection', true, true],
  ['Explains Why', true, false],
  ['Word-level Analysis', true, false],
  ['99.3% Accuracy', true, false],
  ['Zero Data Stored', true, false],
  ['Read-only Access', true, true],
  ['Free to Use', true, false],
]

const IMPACT_WORDS = [
  { label: 'WON', val: 0.88, spam: true },
  { label: 'CLAIM', val: 0.74, spam: true },
  { label: 'PRIZE', val: 0.68, spam: true },
  { label: 'URGENT', val: 0.54, spam: true },
  { label: 'alex@studio', val: 0.61, spam: false },
  { label: 'pm@company', val: 0.42, spam: false },
  { label: 'review', val: 0.22, spam: false },
]

/* ─── Helpers ─── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.09, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function Tag({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '5px 16px', border: '1px solid #B8860B44', borderRadius: 2,
      marginBottom: 18, fontSize: '0.65rem', fontWeight: 700,
      letterSpacing: '.14em', textTransform: 'uppercase', color: '#C9A84C',
      fontFamily: "'Montserrat',sans-serif",
    }}>{children}</div>
  )
}

function GoldRule({ w = '100%', style = {} }) {
  return <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#C9A84C55,transparent)', width: w, ...style }} />
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export default function MailJiLanding() {
  const [loading, setLoading] = useState(false)
  const [hovFeat, setHovFeat] = useState(null)
  const { scrollY } = useScroll()
  const hParallax = useTransform(scrollY, [0, 500], [0, -36])

  useEffect(() => {
    const lnk = document.createElement('link')
    lnk.rel = 'stylesheet'
    lnk.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Pinyon+Script&display=swap'
    document.head.appendChild(lnk)

    const sty = document.createElement('style')
    sty.textContent = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{background:#0A0A0A;overflow-x:hidden}
      @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @keyframes pdot{0%,100%{opacity:1}50%{opacity:.25}}

      /* ── Layout helpers ── */
      .hero-wrap{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:64px;
        align-items:center;
        max-width:1200px;
        margin:0 auto;
        width:100%;
      }
      .feat-grid{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        border:1px solid #B8860B33;
      }
      .steps-wrap{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:48px;
      }
      .stats-wrap{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        border:1px solid #B8860B33;
      }
      .cmp-wrap{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:48px;
        align-items:start;
      }
      .nav-links-wrap{display:flex;align-items:center;gap:32px}

      @media(max-width:1024px){
        .feat-grid{grid-template-columns:repeat(2,1fr)}
        .cmp-wrap{grid-template-columns:1fr}
        .stats-wrap{grid-template-columns:repeat(2,1fr)}
      }
      @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes spinReverse{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
      @media(max-width:768px){
        .hero-wrap{grid-template-columns:1fr}
        .hero-img{display:flex!important;justify-content:center;margin-top:16px}
        .feat-grid{grid-template-columns:1fr}
        .steps-wrap{grid-template-columns:1fr;gap:36px}
        .nav-links-wrap{display:none}
      }
      @media(max-width:480px){
        .stats-wrap{grid-template-columns:1fr 1fr}
      }

      ::-webkit-scrollbar{width:3px}
      ::-webkit-scrollbar-track{background:#0A0A0A}
      ::-webkit-scrollbar-thumb{background:#B8860B}
    `
    document.head.appendChild(sty)
  }, [])

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mailji.onrender.com'

  async function go() {
    setLoading(true)
    try {
      const r = await fetch(`${BACKEND_URL}/auth/login`)
      const d = await r.json()
      window.location.href = d.auth_url
    } catch (err) {
      console.error('Backend error:', err)
      alert('Could not connect to backend. Please try again shortly — the server may be waking up (Render free tier takes ~30s).')
      setLoading(false)
    }
  }

  /* ── tokens ── */
  const T = {
    black: '#0A0A0A', bMid: '#111111', bSoft: '#1A1A1A', bCard: '#141414',
    bdr: '#252525', bdrG: '#B8860B33',
    gold: '#C9A84C', goldB: '#E2B84A', goldD: '#8A6A20',
    cream: '#F5EDD6', crmD: '#C8BA9A',
    red: '#C0392B', redL: '#E07070',
    grn: '#1A7A4A', grnL: '#4CAF7D',
    mont: "'Montserrat',sans-serif",
    corm: "'Cormorant Garamond',Georgia,serif",
    scr: "'Pinyon Script',cursive",
    px: 'clamp(24px,6vw,96px)',
  }

  const secPad = `clamp(80px,10vw,120px) ${T.px}`

  /* ── shared btn styles ── */
  const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '13px 30px', borderRadius: 3,
    background: T.gold, color: T.black, border: 'none',
    fontFamily: T.mont, fontWeight: 800, fontSize: '.86rem',
    letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
  }
  const btnGhost = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 26px', borderRadius: 3,
    background: 'transparent', color: T.cream,
    border: `1px solid ${T.bdr}`,
    fontFamily: T.mont, fontWeight: 600, fontSize: '.84rem',
    letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
    transition: 'border-color .22s',
  }

  return (
    <div style={{ background: T.black, color: T.cream, fontFamily: T.mont, overflowX: 'hidden' }}>

      {/* ━━━━━━━━━━━━━━━━━━ NAVBAR ━━━━━━━━━━━━━━━━━━ */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `0 ${T.px}`,
          background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${T.bdrG}`,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
            {/* <Mail size={15} color={T.black} strokeWidth={2.5} /> */}
            <img src="/logo-white.png" width="78px"></img>
          </div>
          {/* <span style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontFamily: T.mont, fontWeight: 900, fontSize: '1.18rem', color: '#fff', letterSpacing: '-.01em' }}>Mail</span>
            <span style={{ fontFamily: T.scr, color: T.gold, fontSize: '1.95rem', lineHeight: .82 }}>Ji</span>
          </span> */}
        </div>

        {/* Nav links */}
        <div className="nav-links-wrap">
          {[['#about', 'About'], ['#why-mailji', 'Why MailJi'], ['#features', 'Features'], ['#how-it-works', 'How It Works']].map(([href, lbl]) => (
            <a key={lbl} href={href}
              style={{ fontSize: '.76rem', fontWeight: 600, color: `${T.crmD}88`, textDecoration: 'none', letterSpacing: '.05em', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = T.gold}
              onMouseLeave={e => e.target.style.color = `${T.crmD}88`}
            >{lbl}</a>
          ))}
        </div>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={go} disabled={loading} style={btnPrimary}>
          <Mail size={13} />{loading ? 'Connecting...' : 'Try Free'}
        </motion.button>
      </motion.nav>

      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section style={{ minHeight: '100vh', padding: `128px ${T.px} 90px`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${T.bdrG} 1px,transparent 1px),linear-gradient(90deg,${T.bdrG} 1px,transparent 1px)`,
          backgroundSize: '72px 72px', opacity: .5,
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: `linear-gradient(to top,${T.black},transparent)`, zIndex: 1, pointerEvents: 'none' }} />

        <div className="hero-wrap" style={{ position: 'relative', zIndex: 2 }}>

          {/* LEFT */}
          <motion.div style={{ y: hParallax }}>
            <motion.div
              initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 15px', border: `1px solid ${T.gold}`, borderRadius: 2, marginBottom: 34, fontSize: '.64rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: T.gold }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.gold, animation: 'pdot 2s ease infinite', display: 'inline-block' }} />
              Explainable AI · Email Protection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .1 }}
              style={{ marginBottom: 22, lineHeight: 1.0 }}
            >
              <span style={{ display: 'block', fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(2.2rem,5vw,4.4rem)', color: '#fff', letterSpacing: '-0.03em' }}>
                Namaste, Dost.
              </span>
              <span style={{ display: 'block', fontFamily: T.corm, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2.6rem,5.8vw,5.0rem)', color: T.gold, letterSpacing: '-0.01em', lineHeight: 1.06 }}>
                Your Inbox is Safe, Ji.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .18 }}
              style={{ fontSize: 'clamp(.86rem,1.4vw,.98rem)', color: T.crmD, lineHeight: 1.9, maxWidth: 460, marginBottom: 38, fontWeight: 400 }}
            >
              AI-powered spam protection that tells you not just what's spam —
              but <em style={{ color: T.goldB, fontStyle: 'italic' }}>exactly kya chal raha hai</em>, explained in plain language.
              Bilkul seedha, no nautanki.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .26 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}
            >
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={go} disabled={loading} style={btnPrimary}>
                <Mail size={15} />{loading ? 'Connecting...' : 'Connect Gmail'}<ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, borderColor: T.gold }} whileTap={{ scale: .97 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                style={btnGhost}
              >
                <Activity size={14} color={T.gold} />See How It Works
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .44 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 26px' }}>
              {['No credit card required', 'Read-only Gmail access', 'Zero data stored, kabhi nahi'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.68rem', color: `${T.crmD}77`, fontWeight: 500 }}>
                  <Check size={11} color={T.goldD} strokeWidth={2.5} />{t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — mascot with animated circular bg */}
          <div className="hero-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

            {/* Outermost slow-spin ring */}
            <div style={{
              position: 'absolute', inset: 0, margin: 'auto',
              width: 380, height: 380,
              animation: 'spinSlow 32s linear infinite',
              pointerEvents: 'none',
            }}>
              <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
                <circle cx="190" cy="190" r="186" stroke="#C9A84C" strokeWidth="1" strokeDasharray="6 14" opacity=".35" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(r => (
                  <g key={r} transform={`rotate(${r} 190 190)`}>
                    <path d="M190 4 L195 16 L190 13 L185 16 Z" fill="#C9A84C" opacity=".5" />
                  </g>
                ))}
              </svg>
            </div>

            {/* Second ring — counter-rotate */}
            <div style={{
              position: 'absolute', inset: 0, margin: 'auto',
              width: 340, height: 340,
              animation: 'spinReverse 22s linear infinite',
              pointerEvents: 'none',
            }}>
              <svg width="340" height="340" viewBox="0 0 340 340" fill="none">
                <circle cx="170" cy="170" r="166" stroke="#C9A84C" strokeWidth=".6" strokeDasharray="3 20" opacity=".25" />
                {[...Array(12)].map((_, i) => {
                  const a = (i / 12) * Math.PI * 2
                  return <circle key={i} cx={170 + Math.cos(a) * 166} cy={170 + Math.sin(a) * 166} r="3" fill="#C9A84C" opacity=".45" />
                })}
              </svg>
            </div>

            {/* Third ring — slow spin same direction */}
            <div style={{
              position: 'absolute', inset: 0, margin: 'auto',
              width: 280, height: 280,
              animation: 'spinSlow 48s linear infinite',
              pointerEvents: 'none',
            }}>
              <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
                <rect x="2" y="2" width="276" height="276" stroke="#C9A84C" strokeWidth=".6" strokeDasharray="2 12" opacity=".2" transform="rotate(45 140 140)" />
                <circle cx="140" cy="140" r="136" stroke="#C9A84C" strokeWidth=".5" opacity=".15" />
              </svg>
            </div>

            {/* Static glow blob behind mascot */}
            <div style={{
              position: 'absolute', inset: 0, margin: 'auto',
              width: 240, height: 240,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${T.gold}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <motion.div
              initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: .8, delay: .25 }}
              style={{ position: 'relative', zIndex: 2 }}
            >
              <img
                src="https://png.pngtree.com/png-vector/20220821/ourmid/pngtree-indian-man-with-turban-rajasthani-men-welcome-namaste-greetings-png-image_6119228.png"
                alt="MailJi mascot"
                style={{ width: 'clamp(200px,22vw,320px)', display: 'block', filter: 'saturate(.85) contrast(1.06)' }}
              />
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 180 }}
                style={{
                  position: 'absolute', top: 12, right: -18,
                  background: T.black, color: T.gold,
                  padding: '10px 16px',
                  border: `1px solid ${T.gold}`,
                  borderRadius: '12px 12px 2px 12px',
                  fontFamily: T.mont, fontWeight: 700, fontSize: '.76rem',
                  whiteSpace: 'nowrap', letterSpacing: '.03em', zIndex: 3,
                }}
              >
                Namaste! Inbox safe hai Ji!
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ MARQUEE ━━━━━━━━━━━━━━━━━━ */}
      <div style={{ borderTop: `1px solid ${T.bdrG}`, borderBottom: `1px solid ${T.bdrG}`, overflow: 'hidden', background: T.bMid }}>
        <div style={{ display: 'flex', animation: 'mq 32s linear infinite', width: 'max-content', whiteSpace: 'nowrap', padding: '12px 0', alignItems: 'center' }}>
          {[...Array(2)].map((_, k) =>
            ['🙏 Namaste, Inbox!', '◆', 'Instant Spam Detection', '◆', '99.3% Accuracy', '◆', 'Gmail Native, Ji', '◆', 'Zero Data Stored', '◆', 'Free Forever', '◆', 'Explainable AI', '◆'].map((t, i) => (
              <span key={`${k}-${i}`} style={{ padding: '0 22px', fontFamily: T.mont, fontWeight: t === '◆' ? 400 : 700, fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', color: t === '◆' ? `${T.gold}33` : T.gold }}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━ STATS ━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: T.bCard, borderBottom: `1px solid ${T.bdrG}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `0 ${T.px}` }}>
          <div className="stats-wrap">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i}>
                <div style={{ padding: 'clamp(36px,5vw,52px) clamp(20px,3vw,36px)', borderRight: `1px solid ${T.bdrG}`, textAlign: 'center' }}>
                  <div style={{ fontFamily: T.corm, fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(2rem,3.6vw,3rem)', color: T.gold, lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
                  <div style={{ fontSize: '.68rem', fontWeight: 700, color: `${T.crmD}66`, letterSpacing: '.12em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ ABOUT ━━━━━━━━━━━━━━━━━━ */}
      <AboutSection />

      {/* ━━━━━━━━━━━━━━━━━━ WHY MAILJI ━━━━━━━━━━━━━━━━━━ */}
      <section id="why-mailji" style={{ padding: secPad, background: T.bMid, borderTop: `1px solid ${T.bdrG}`, borderBottom: `1px solid ${T.bdrG}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <Reveal style={{ marginBottom: 60 }}>
            <Tag>✦ Why Choose MailJi</Tag>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
              <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4vw,3.2rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.025em' }}>The Smarter</h2>
              <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.8rem)', color: T.gold, lineHeight: 1 }}>Spam Guard, Ji.</span>
            </div>
            <p style={{ fontSize: '.94rem', color: T.crmD, lineHeight: 1.85, maxWidth: 560 }}>
              Most spam filters just block — they never tell you why. MailJi is different. Every verdict comes with a clear breakdown of exactly what triggered it. Seedha analysis, zero guesswork.
            </p>
          </Reveal>

          <div className="cmp-wrap">

            {/* Comparison table */}
            <Reveal>
              <div style={{ border: `1px solid ${T.bdrG}`, borderRadius: 4, overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: T.bCard, borderBottom: `1px solid ${T.bdrG}` }}>
                  <div style={{ padding: '15px 20px', fontSize: '.65rem', fontWeight: 800, color: `${T.crmD}55`, letterSpacing: '.12em', textTransform: 'uppercase' }}>Feature</div>
                  <div style={{ padding: '15px 20px', fontSize: '.65rem', fontWeight: 800, color: T.gold, letterSpacing: '.12em', textTransform: 'uppercase', borderLeft: `1px solid ${T.bdrG}`, textAlign: 'center' }}>MailJi 🙏</div>
                  <div style={{ padding: '15px 20px', fontSize: '.65rem', fontWeight: 800, color: `${T.crmD}44`, letterSpacing: '.12em', textTransform: 'uppercase', borderLeft: `1px solid ${T.bdrG}`, textAlign: 'center' }}>Others</div>
                </div>

                {COMPARE.map(([lbl, mj, oth], i) => (
                  <motion.div key={lbl}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * .06 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < COMPARE.length - 1 ? `1px solid ${T.bdrG}` : 'none', background: i % 2 === 0 ? 'transparent' : `${T.black}66` }}
                  >
                    <div style={{ padding: '13px 20px', fontSize: '.82rem', color: T.crmD, fontWeight: 500 }}>{lbl}</div>
                    <div style={{ padding: '13px 20px', borderLeft: `1px solid ${T.bdrG}`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {mj ? <Check size={15} color={T.gold} strokeWidth={2.5} /> : <span style={{ color: `${T.crmD}22`, fontSize: '.9rem' }}>—</span>}
                    </div>
                    <div style={{ padding: '13px 20px', borderLeft: `1px solid ${T.bdrG}`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {oth ? <Check size={15} color={`${T.crmD}44`} strokeWidth={1.8} /> : <span style={{ color: `${T.crmD}22`, fontSize: '.9rem' }}>—</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>

            {/* Word impact panel */}
            <Reveal delay={2}>
              <div style={{ border: `1px solid ${T.bdrG}`, borderRadius: 4, padding: 'clamp(24px,4vw,36px)', background: T.bCard }}>
                <p style={{ fontSize: '.65rem', fontWeight: 800, color: T.gold, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Word Impact Breakdown
                </p>
                <p style={{ fontSize: '.8rem', color: `${T.crmD}66`, marginBottom: 28, lineHeight: 1.75 }}>
                  MailJi shows exactly which words pushed an email toward spam — and which pulled it away, Ji.
                </p>

                {IMPACT_WORDS.map((item, i) => (
                  <motion.div key={item.label}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * .07 + .1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}
                  >
                    <span style={{ fontSize: '.68rem', color: `${T.crmD}55`, width: 86, textAlign: 'right', flexShrink: 0, fontFamily: "'Courier New',monospace", fontWeight: 600 }}>{item.label}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 22, background: `${T.cream}06`, borderRadius: 1, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${item.val * 100}%` }}
                          viewport={{ once: true }} transition={{ delay: i * .07 + .2, duration: .85 }}
                          style={{
                            height: '100%',
                            background: item.spam ? `linear-gradient(90deg,${T.red}AA,${T.red})` : `linear-gradient(90deg,${T.grn}AA,${T.grnL})`,
                            display: 'flex', alignItems: 'center', paddingLeft: 8,
                          }}
                        >
                          <span style={{ fontSize: '9px', color: '#fff', fontFamily: 'monospace', fontWeight: 800 }}>
                            {item.spam ? '+' : '-'}{item.val.toFixed(2)}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <GoldRule style={{ marginTop: 20, marginBottom: 14 }} />
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: '.68rem', color: `${T.crmD}44` }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: T.red, transform: 'rotate(45deg)', flexShrink: 0 }} /> Spam signal
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: T.grnL, transform: 'rotate(45deg)', flexShrink: 0 }} /> Safe signal, Ji
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━━━━━━━ */}
      <section id="features" style={{ padding: secPad, background: T.black }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <Reveal style={{ marginBottom: 52 }}>
            <Tag>✦ Sabse Khaas Features</Tag>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
              <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4vw,3.2rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.025em' }}>Built for Real</h2>
              <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.8rem)', color: T.gold, lineHeight: 1 }}>Clarity, Ji.</span>
            </div>
            <p style={{ fontSize: '.94rem', color: T.crmD, lineHeight: 1.85, maxWidth: 520 }}>
              Not just a spam filter — MailJi explains <em style={{ color: T.goldB }}>kyun</em> using real feature analysis from your actual emails.
            </p>
          </Reveal>

          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * .55}>
                <motion.div
                  onHoverStart={() => setHovFeat(i)} onHoverEnd={() => setHovFeat(null)}
                  style={{
                    padding: 'clamp(28px,4vw,44px) clamp(22px,3vw,36px)',
                    borderRight: `1px solid ${T.bdrG}`, borderBottom: `1px solid ${T.bdrG}`,
                    background: hovFeat === i ? T.bSoft : 'transparent',
                    transition: 'background .25s', cursor: 'default',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Bg number */}
                  <div style={{ position: 'absolute', top: 14, right: 18, fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: '3.2rem', color: `${T.gold}0E`, lineHeight: 1, userSelect: 'none' }}>{f.no}</div>

                  {/* Icon box */}
                  <div style={{
                    width: 46, height: 46, borderRadius: 3,
                    border: `1px solid ${hovFeat === i ? T.gold : T.bdrG}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 22, background: hovFeat === i ? `${T.gold}10` : 'transparent',
                    transition: 'all .25s',
                  }}>
                    <f.icon size={19} color={hovFeat === i ? T.gold : T.goldD} strokeWidth={1.8} />
                  </div>

                  <h3 style={{ fontFamily: T.mont, fontWeight: 800, fontSize: '.94rem', color: '#fff', marginBottom: 10, lineHeight: 1.35, letterSpacing: '-.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: '.82rem', color: T.crmD, lineHeight: 1.85 }}>{f.desc}</p>

                  {/* Bottom hover line */}
                  <motion.div animate={{ width: hovFeat === i ? '100%' : '0%' }} transition={{ duration: .28 }}
                    style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: T.gold }} />
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ LIVE DEMO ━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: secPad, background: T.bMid, borderTop: `1px solid ${T.bdrG}`, borderBottom: `1px solid ${T.bdrG}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <Reveal style={{ marginBottom: 52 }}>
            <Tag>✦ Live Preview</Tag>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
              <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4vw,3.2rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.025em' }}>Dekho</h2>
              <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.8rem)', color: T.gold, lineHeight: 1 }}>Kaise Kaam Karta Hai</span>
            </div>
            <p style={{ fontSize: '.92rem', color: T.crmD, lineHeight: 1.85 }}>
              Har email ko verdict milta hai — aur saath mein reason bhi, bilkul clear.
            </p>
          </Reveal>

          <Reveal>
            <div style={{ border: `1px solid ${T.bdrG}`, borderRadius: 4, overflow: 'hidden' }}>

              {/* Chrome */}
              <div style={{ padding: '13px 20px', borderBottom: `1px solid ${T.bdrG}`, background: T.bCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 7 }}>
                  {['#C0392B', '#C9A84C', '#27AE60'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontSize: '.63rem', color: `${T.crmD}44`, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700 }}>MailJi · Inbox Scanner</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['3 Spam', T.red, `${T.red}1A`], ['2 Safe', T.grnL, `${T.grn}1A`]].map(([lbl, clr, bg]) => (
                    <span key={lbl} style={{ padding: '3px 11px', borderRadius: 2, fontSize: '.6rem', fontWeight: 800, color: clr, background: bg, border: `1px solid ${clr}33`, letterSpacing: '.07em', textTransform: 'uppercase' }}>{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {DEMO_EMAILS.map((e, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * .08, duration: .4 }}
                  whileHover={{ background: `${T.bdr}44` }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: i < 4 ? `1px solid ${T.bdrG}` : 'none', borderLeft: `3px solid ${e.spam ? T.red : T.grnL}`, transition: 'background .15s', cursor: 'default' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.84rem', color: e.spam ? T.redL : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4, letterSpacing: '-.01em' }}>{e.subject}</div>
                    <div style={{ fontSize: '.67rem', color: `${T.crmD}44` }}>{e.sender}</div>
                    {e.words.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                        {e.words.map(w => <span key={w} style={{ padding: '2px 7px', borderRadius: 2, background: `${T.red}1A`, color: T.redL, fontSize: '.56rem', fontWeight: 800, letterSpacing: '.08em', border: `1px solid ${T.red}33` }}>{w}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ width: 96, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '.58rem', color: `${T.crmD}44`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>{e.spam ? 'Spam' : 'Safe'}</span>
                      <span style={{ fontSize: '.62rem', fontWeight: 800, color: e.spam ? T.redL : T.grnL }}>{Math.round(e.prob * 100)}%</span>
                    </div>
                    <div style={{ height: 4, background: `${T.cream}0A`, borderRadius: 1, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: `${e.prob * 100}%` }}
                        viewport={{ once: true }} transition={{ delay: .3 + i * .08, duration: .9 }}
                        style={{ height: '100%', borderRadius: 1, background: e.spam ? `linear-gradient(90deg,${T.red},${T.redL})` : `linear-gradient(90deg,${T.grn},${T.grnL})` }}
                      />
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 2, flexShrink: 0, background: e.spam ? `${T.red}18` : `${T.grn}22`, color: e.spam ? T.redL : T.grnL, fontSize: '.6rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', border: `1px solid ${e.spam ? T.red : T.grnL}33` }}>
                    {e.spam ? `${Math.round(e.prob * 100)}% Spam` : 'Safe ✓'}
                  </span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" style={{ padding: secPad, background: T.black }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
            <Tag>✦ Seedha Simple Process</Tag>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
              <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4vw,3.2rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.025em' }}>Ready in</h2>
              <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.8rem)', color: T.gold, lineHeight: 1 }}>ek minute, Ji.</span>
            </div>
            <p style={{ fontSize: '.93rem', color: T.crmD, lineHeight: 1.85, maxWidth: 420, margin: '0 auto' }}>
              No setup, no confusion, no nautanki. Just connect and go.
            </p>
          </Reveal>

          <div className="steps-wrap" style={{ position: 'relative' }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 1.2}>
                <div style={{ textAlign: 'center', position: 'relative', padding: '0 16px' }}>
                  {/* Step number circle */}
                  <div style={{ width: 72, height: 72, borderRadius: '50%', border: `1px solid ${T.gold}`, background: T.bCard, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 700, fontSize: '1.75rem', color: T.gold, lineHeight: 1 }}>{s.n}</span>
                  </div>
                  <GoldRule w={32} style={{ margin: '0 auto 22px' }} />
                  <h3 style={{ fontFamily: T.mont, fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 12, letterSpacing: '-.01em' }}>{s.title}</h3>
                  <p style={{ fontSize: '.86rem', color: T.crmD, lineHeight: 1.88, maxWidth: 250, margin: '0 auto' }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ FINAL CTA ━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: secPad, background: T.black }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              border: `1px solid ${T.gold}55`, borderRadius: 4,
              padding: 'clamp(52px,7vw,80px) clamp(36px,6vw,72px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
              background: T.bCard,
            }}>
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${T.gold},${T.goldB},${T.gold},transparent)` }} />

              {/* Corner diamonds */}
              {[{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }].map((pos, i) => (
                <div key={i} style={{ position: 'absolute', width: 7, height: 7, background: `${T.gold}44`, transform: 'rotate(45deg)', ...pos }} />
              ))}

              <div style={{ fontSize: '2.6rem', marginBottom: 22 }}>🙏</div>

              <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4.8vw,3.4rem)', color: '#fff', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.025em' }}>
                Aapka Inbox,
              </h2>
              <p style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,5.2vw,4rem)', color: T.gold, lineHeight: 1, marginBottom: 24 }}>
                Humari Zimmedaari.
              </p>

              <GoldRule style={{ width: 72, margin: '0 auto 26px' }} />

              <p style={{ color: T.crmD, fontSize: '.95rem', lineHeight: 1.88, fontWeight: 400, maxWidth: 420, margin: '0 auto 38px' }}>
                Free. Secure. Powered by real AI. Get your first spam analysis in under a minute. Guaranteed, Ji.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 30 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={go} disabled={loading} style={{ ...btnPrimary, padding: '14px 36px', fontSize: '.9rem' }}>
                  <Mail size={16} />{loading ? 'Connecting...' : 'Create Free Account'}<ArrowRight size={16} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.02, borderColor: T.gold }} whileTap={{ scale: .97 }}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ ...btnGhost, padding: '13px 28px' }}
                >
                  See All Features
                </motion.button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 26, flexWrap: 'wrap' }}>
                {['No signup required', 'Read-only access', 'Zero data, zero tension'].map(t => (
                  <span key={t} style={{ fontSize: '.68rem', color: `${T.crmD}44`, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                    <Check size={10} color={T.goldD} strokeWidth={2.5} />{t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━━━ */}
      <footer style={{ background: T.bCard, borderTop: `1px solid ${T.bdrG}`, padding: `clamp(40px,5vw,58px) ${T.px}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 22, paddingBottom: 26, borderBottom: `1px solid ${T.bdrG}` }}>

            <span style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              {/* <span style={{ fontFamily: T.mont, fontWeight: 900, fontSize: '1.18rem', color: '#fff', letterSpacing: '-.01em' }}>Mail</span>
              <span style={{ fontFamily: T.scr, color: T.gold, fontSize: '1.9rem', lineHeight: .82 }}>Ji</span> */}
              <img src="/logo-white.png" width="78px"></img>
            </span>


            <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
              {[['#about', 'About'], ['#why-mailji', 'Why MailJi'], ['#features', 'Features'], ['#how-it-works', 'How It Works']].map(([href, lbl]) => (
                <a key={lbl} href={href}
                  style={{ fontSize: '.76rem', color: `${T.crmD}44`, textDecoration: 'none', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = T.gold}
                  onMouseLeave={e => e.target.style.color = `${T.crmD}44`}
                >{lbl}</a>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,transparent,${T.gold}14)` }} />
            <p style={{ fontSize: '.66rem', color: `${T.crmD}28`, fontFamily: T.mont, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              © {new Date().getFullYear()} MailJi · AI-Powered Spam Raksha · Free & Private ·
            </p>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${T.gold}14,transparent)` }} />
          </div>
        </div>
      </footer>
    </div>
  )
}
