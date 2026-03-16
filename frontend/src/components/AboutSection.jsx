import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { AlertTriangle, Search, Lock } from 'lucide-react'

/* ─── Design tokens — same as LandingPage.jsx ──────────────────────────────── */
const T = {
  black: '#0A0A0A',
  bMid: '#111111',
  bCard: '#141414',
  bSoft: '#1A1A1A',
  bdrG: '#B8860B33',
  gold: '#C9A84C',
  goldB: '#E2B84A',
  goldD: '#8A6A20',
  cream: '#F5EDD6',
  crmD: '#C8BA9A',
  mont: "'Montserrat', sans-serif",
  corm: "'Cormorant Garamond', Georgia, serif",
}

/* ─── Team — Row 1 ──────────────────────────────────────────────────────────── */
const ROW1 = [
  {
    name: 'Vikrant Kadam',
    role: 'Lead Developer · Lead Full Stack',
    email: 'vikrant.1252010030@vit.edu',
    github: 'https://github.com/VikrantKadam028',
    linkedin: 'https://www.linkedin.com/in/vikrantkadam028',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQHpHv_qLw8YRA/profile-displayphoto-scale_400_400/B4DZvMEFsRG8Ag-/0/1768655185486?e=1774483200&v=beta&t=1vhWR4q-Ykaok5ZJ0atCb8e1Tbe6kqrnyNu1uMiqjkA',
    avatar: 'VK',
    tag: 'The Full-Stack Architect',
    bio: 'Jab team mein koi stuck hota hai, Vikrant already solution soch chuka hota hai. Frontend se backend tak, DevOps se deployment tak poora system ek saath chalana Vikrant ki zimmedaari hai. Captain hai, Ji..',
    accent: '#2471A3',
  },
  {
    name: 'Kartik Pagariya',
    role: 'Lead Developer · AI/ML Engineer',
    email: 'kartik.pagariya25@vit.edu',
    github: 'https://github.com/kartikpagariya25',
    linkedin: 'https://linkedin.com/in/kartikpagariya1911',
    image: 'https://media.licdn.com/dms/image/v2/D4E03AQHfIoFibBhVIA/profile-displayphoto-scale_400_400/B4EZqwcW3eKUAg-/0/1763896816362?e=1774483200&v=beta&t=YnNS5W0gCU8alDq7uufwd8Rgi0C3UYg0MPAY2lqvljA',
    avatar: 'KP',
    tag: 'ML Mastermind',
    bio: 'Model training, EDA pipeline, LIME explainability — 99.3% accuracy ke peeche Kartik ka dimaag aur mehnat hai. Data ka asli raja, Ji. EDA, LIME, TF-IDF — sab Kartik ke haath ka kaam hai. 99.3% accuracy sirf flex nahi, proof hai. Data scientist nahi — Data Sikandar.',
    accent: '#6C3AC9',
  },
  {
    name: 'Aditya Dengale',
    role: 'Lead Backend Engineer · DevOps Engineer',
    email: 'aditya.1252010025@vit.edu',
    github: 'https://github.com/DevXDividends',
    linkedin: 'https://linkedin.com/in/adityadengale',
    image: 'https://media.licdn.com/dms/image/v2/D4D03AQEn0yj5zoQwHg/profile-displayphoto-scale_400_400/B4DZjHJmYJH0Ak-/0/1755687840955?e=1774483200&v=beta&t=KTzdCk0W9ZF9B-lQsciuM3RfmpnyDO0jS5E0AuJknWg',
    avatar: 'AD',
    tag: 'The Backend Boss',
    bio: 'Koi nahi jaanta Aditya ne kitni baar 2 baje uth ke server fix kiya. Koi nahi jaanta kitne edge cases usne silently handle kiye. MailJi ka har successful request Aditya ki mehnat ka saboot hai, Real Backend Hero, Ji',
    accent: '#1A7A4A',
  },
]

/* ─── Team — Row 2 ──────────────────────────────────────────────────────────── */
const ROW2 = [
  {
    name: 'Janhavi Pagare',
    role: 'Frontend Developer · UX Designer',
    email: 'janhvi.1252010010@vit.edu',
    github: 'https://github.com/janhvi-2403',
    linkedin: 'https://www.linkedin.com/in/janhvi-pagare-1196b62b8',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQGXR4XlGf5_VA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727168370273?e=1774483200&v=beta&t=bKga19UZNECRalIb0Klmy0yJ3vIKMiuLEzqMQ_rFD0M',
    avatar: 'JP',
    tag: 'The Design Diva',
    bio: 'Bhai log backend mein the, Janhavi pixels pe war kar rahi thi. Har card, har badge, har animation usne itni baar refine kiya ki MailJi aaj jitna beautiful hai — woh sab Janhavi ki obsession ka result hai. Design nahi kiya, craft kiya hai, Ji.',
    accent: '#C0392B',
  },
  {
    name: 'Pranali Yelavikar',
    role: 'Data Analyst · Researcher',
    email: 'pranali.yelavikar25@vit.edu',
    github: 'https://github.com/pranaliyelavikar14',
    linkedin: 'https://www.linkedin.com/in/pranali-yelavikar-2b3178383/',
    image: 'https://avatars.githubusercontent.com/u/235873957?v=4',
    avatar: 'PY',
    tag: 'The Data Detective',
    bio: 'Research woh kaam hai jo dikhta nahi par feel hota hai. Pranali ne wo foundation banaya jiske upar team ka confidence khada hai. Enron dataset ka har row usne jaana, har metric usne validate kiya. Bina Pranali ke 99.3% sirf ek lucky guess hota.',
    accent: '#B8860B',
  },
]

/* ─── Motive data ───────────────────────────────────────────────────────────── */
const MOTIVES = [
  {
    no: '01',
    Icon: AlertTriangle,
    title: 'Kyunki Spam Se Dar Lagta Hai, Ji',
    desc: 'Roz 3.4 billion spam emails aate hain. Ek wrong click — aur sab kuch khatam. MailJi us gusse se bana hai jo tab aaya jab ek dost ka inbox hack hua. Woh din yaad hai abhi bhi.',
  },
  {
    no: '02',
    Icon: Search,
    title: '"Blocked" Enough Nahi Hai, Bhai',
    desc: 'Baaki filters sirf rokte hain — batate nahi kyun. Hum mante hain aapko pata hona chahiye exactly kaun sa word suspicious tha. LIME explainability isliye hai — transparency pehle, baaki baad mein.',
  },
  {
    no: '03',
    Icon: Lock,
    title: 'Privacy Is Non-Negotiable, Yaar',
    desc: 'Aapke emails sirf aapke hain. MailJi classify karta hai — store nahi karta, log nahi karta, bechta toh bilkul nahi. Read kiya, protect kiya, bhool gaye. Zero data, zero tension, Ji.',
  },
]

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref} style={style}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionTag({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '5px 16px', border: `1px solid ${T.gold}44`,
      borderRadius: 2, marginBottom: 18,
      fontSize: '0.65rem', fontWeight: 700,
      letterSpacing: '.14em', textTransform: 'uppercase',
      color: T.gold, fontFamily: T.mont,
    }}>
      {children}
    </div>
  )
}

const GithubSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const LinkedInSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

/* ─── Team Card ─────────────────────────────────────────────────────────────── */
function TeamCard({ member, index }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Reveal delay={index * 1.0} style={{ height: '100%' }}>
      <motion.div
        whileHover={{ y: -6, transition: { duration: .18 } }}
        style={{
          background: T.bCard,
          border: `1px solid ${T.bdrG}`,
          borderRadius: 4,
          padding: '40px 32px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${member.accent}, transparent)`,
        }} />

        {/* Corner diamonds */}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 5, height: 5, background: `${member.accent}33`, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 5, height: 5, background: `${member.accent}33`, transform: 'rotate(45deg)' }} />

        {/* Profile photo */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: `2.5px solid ${member.accent}88`,
          overflow: 'hidden',
          marginBottom: 20,
          flexShrink: 0,
          background: `${member.accent}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {!imgError ? (
            <img
              src={member.image}
              alt={member.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <span style={{
              fontFamily: T.mont, fontWeight: 900,
              fontSize: '1.4rem', color: member.accent,
            }}>
              {member.avatar}
            </span>
          )}
        </div>

        {/* Tag badge */}
        <span style={{
          display: 'inline-block',
          padding: '3px 14px',
          borderRadius: 2,
          background: `${member.accent}18`,
          border: `1px solid ${member.accent}44`,
          color: member.accent,
          fontSize: '.6rem',
          fontWeight: 800,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          fontFamily: T.mont,
          marginBottom: 14,
        }}>
          {member.tag}
        </span>

        {/* Name */}
        <h3 style={{
          fontFamily: T.mont,
          fontWeight: 900,
          fontSize: '1.02rem',
          color: '#fff',
          marginBottom: 7,
          letterSpacing: '-.01em',
        }}>
          {member.name}
        </h3>

        {/* Role */}
        <p style={{
          fontSize: '.68rem',
          color: member.accent,
          fontWeight: 700,
          letterSpacing: '.04em',
          lineHeight: 1.65,
          marginBottom: 18,
          fontFamily: T.mont,
        }}>
          {member.role}
        </p>

        {/* Divider */}
        <div style={{
          height: 1, width: '80%',
          background: `linear-gradient(90deg, transparent, ${member.accent}44, transparent)`,
          marginBottom: 16,
        }} />

        {/* Bio */}
        <p style={{
          fontSize: '.8rem',
          color: T.crmD,
          lineHeight: 1.82,
          fontWeight: 400,
          fontFamily: T.mont,
          marginBottom: 22,
          flexGrow: 1,
        }}>
          {member.bio}
        </p>

        {/* Email */}
        <a
          href={`mailto:${member.email}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '.66rem',
            color: `${T.crmD}55`,
            textDecoration: 'none',
            fontFamily: T.mont,
            fontWeight: 500,
            marginBottom: 14,
            transition: 'color .15s',
            wordBreak: 'break-all',
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.cream}
          onMouseLeave={e => e.currentTarget.style.color = `${T.crmD}55`}
        >
          ✉ {member.email}
        </a>

        {/* GitHub + LinkedIn buttons */}
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {[
            { href: member.github, Icon: GithubSVG, label: 'GitHub', hc: T.gold },
            { href: member.linkedin, Icon: LinkedInSVG, label: 'LinkedIn', hc: '#4A90D9' },
          ].map(({ href, Icon, label, hc }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 0',
                borderRadius: 3,
                background: 'transparent',
                border: `1px solid ${T.bdrG}`,
                color: `${T.crmD}66`,
                fontSize: '.65rem',
                fontFamily: T.mont,
                fontWeight: 700,
                letterSpacing: '.05em',
                textDecoration: 'none',
                transition: 'all .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = hc
                e.currentTarget.style.color = hc
                e.currentTarget.style.background = `${hc}12`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = T.bdrG
                e.currentTarget.style.color = `${T.crmD}66`
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon /> {label}
            </a>
          ))}
        </div>
      </motion.div>
    </Reveal>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════════ */
export default function AboutSection() {
  const px = 'clamp(24px,6vw,96px)'

  return (
    <section id="about" style={{ background: T.bMid, borderTop: `1px solid ${T.bdrG}`, borderBottom: `1px solid ${T.bdrG}` }}>

      {/* ══ Responsive CSS ══ */}
      <style>{`
        .mj-row1 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }
        .mj-row2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: 66.66%;
          margin-left: auto;
          margin-right: auto;
        }
        @media (max-width: 960px) {
          .mj-row1 { grid-template-columns: repeat(2, 1fr); }
          .mj-row2 { grid-template-columns: repeat(2, 1fr); width: 100%; }
        }
        @media (max-width: 560px) {
          .mj-row1 { grid-template-columns: 1fr; }
          .mj-row2 { grid-template-columns: 1fr; width: 100%; }
        }
      `}</style>

      {/* ══ MOTIVE BLOCK ══ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `clamp(80px,10vw,120px) ${px}` }}>

        <Reveal style={{ marginBottom: 56 }}>
          <SectionTag>✦ Why We Built This, Ji</SectionTag>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
            <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4vw,3.2rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.025em' }}>
              The Story Behind
            </h2>
            <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.8rem)', color: T.gold, lineHeight: 1 }}>
              MailJi, Ji.
            </span>
          </div>
          <p style={{ fontSize: '.94rem', color: T.crmD, lineHeight: 1.9, maxWidth: 580, fontWeight: 400, fontFamily: T.mont }}>
            Ek din ek dost ka inbox hack hua. Ek phishing link — aur sab kuch gone. That day we decided:{' '}
            <em style={{ color: T.goldB }}>inbox protection should be smart, transparent, aur bilkul free.</em>{' '}
            MailJi woh decision hai jo reality ban gaya.
          </p>
        </Reveal>

        {/* Motive cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', border: `1px solid ${T.bdrG}` }}>
          {MOTIVES.map((m, i) => (
            <Reveal key={m.no} delay={i * 1.4}>
              <motion.div
                whileHover={{ background: T.bSoft }}
                style={{
                  padding: 'clamp(28px,4vw,44px) clamp(22px,3vw,36px)',
                  borderRight: `1px solid ${T.bdrG}`,
                  background: 'transparent', transition: 'background .25s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Background number watermark */}
                <div style={{ position: 'absolute', top: 10, right: 16, fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: '3.4rem', color: `${T.gold}0D`, lineHeight: 1, userSelect: 'none' }}>{m.no}</div>

                {/* Golden icon box */}
                <div style={{
                  width: 46, height: 46, borderRadius: 3,
                  border: `1px solid ${T.bdrG}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                  background: 'transparent',
                }}>
                  <m.Icon size={19} color={T.goldD} strokeWidth={1.8} />
                </div>

                <div style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 700, fontSize: '0.72rem', color: T.gold, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>{m.no}</div>
                <h3 style={{ fontFamily: T.mont, fontWeight: 800, fontSize: '.9rem', color: '#fff', marginBottom: 10, letterSpacing: '-.01em', lineHeight: 1.4 }}>{m.title}</h3>
                <p style={{ fontSize: '.82rem', color: T.crmD, lineHeight: 1.85, fontFamily: T.mont }}>{m.desc}</p>
                <motion.div initial={{ width: 0 }} whileHover={{ width: '100%' }} transition={{ duration: .25 }}
                  style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: T.gold }} />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ══ Divider ══ */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}55, transparent)` }} />

      {/* ══ TEAM BLOCK ══ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `clamp(80px,10vw,120px) ${px}` }}>

        <Reveal style={{ textAlign: 'center', marginBottom: 64 }}>
          <SectionTag>✦ The MailJi Squad</SectionTag>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <h2 style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 'clamp(1.9rem,4vw,3.2rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.025em' }}>
              Meet the
            </h2>
            <span style={{ fontFamily: T.corm, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.8rem)', color: T.gold, lineHeight: 1 }}>
              Builders, Ji.
            </span>
          </div>
          <p style={{ fontSize: '.94rem', color: T.crmD, lineHeight: 1.88, maxWidth: 500, margin: '0 auto', fontWeight: 400, fontFamily: T.mont }}>
            Paanch log. Ek mission.{' '}
            <em style={{ color: T.goldB }}>Aapke inbox ko safe rakhna — hamesha, bilkul free, Ji.</em>
          </p>
        </Reveal>

        {/* Row 1 — Vikrant · Kartik · Aditya */}
        <div className="mj-row1">
          {ROW1.map((m, i) => <TeamCard key={m.name} member={m} index={i} />)}
        </div>

        {/* Row 2 — Janhavi · Pranali  (centered under row 1, each card same width as row-1 cards) */}
        <div className="mj-row2">
          {ROW2.map((m, i) => <TeamCard key={m.name} member={m} index={i + 3} />)}
        </div>

      </div>
    </section>
  )
}
