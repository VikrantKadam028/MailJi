import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, User, Calendar, Brain } from 'lucide-react'

/* ── Theme tokens ── */
const T = {
  black:  '#0A0A0A',
  bCard:  '#141414',
  bSoft:  '#1A1A1A',
  bdrG:   '#B8860B33',
  bdr:    '#252525',
  gold:   '#C9A84C',
  goldB:  '#E2B84A',
  goldD:  '#8A6A20',
  cream:  '#F5EDD6',
  crmD:   '#C8BA9A',
  red:    '#C0392B',
  warn:   '#D97706',
  grn:    '#1A7A4A',
  grnL:   '#4CAF7D',
  mont:   "'Montserrat',sans-serif",
  corm:   "'Cormorant Garamond',Georgia,serif",
}

/* ─── Arc meter ─── */
function ArcMeter({ prob }) {
  const pct   = Math.round(prob * 100)
  const color = prob > 0.8 ? T.red : prob > 0.5 ? T.warn : T.grnL
  const label = prob > 0.8 ? 'High Risk' : prob > 0.5 ? 'Medium Risk' : 'Low Risk'

  const R = 54, cx = 75, cy = 75
  const startAngle = Math.PI * 1.2
  const totalArc   = Math.PI * 1.6
  const endAngle   = startAngle + (pct / 100) * totalArc
  const x1 = cx + R * Math.cos(startAngle)
  const y1 = cy + R * Math.sin(startAngle)
  const x2 = cx + R * Math.cos(endAngle)
  const y2 = cy + R * Math.sin(endAngle)
  const largeArc = (pct / 100) * totalArc > Math.PI ? 1 : 0

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="150" height="100" viewBox="0 0 150 100">
        {/* Track */}
        <path
          d={`M ${cx + R * Math.cos(Math.PI * 1.2)} ${cy + R * Math.sin(Math.PI * 1.2)}
              A ${R} ${R} 0 1 1 ${cx + R * Math.cos(Math.PI * 2.8)} ${cy + R * Math.sin(Math.PI * 2.8)}`}
          fill="none"
          stroke={`${T.gold}18`}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Fill */}
        {pct > 0 && (
          <motion.path
            d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}70)` }}
          />
        )}
        {/* Value */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color}
          style={{ fontFamily: T.mont, fontWeight: 900, fontSize: 22 }}>
          {pct}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={`${T.crmD}88`}
          style={{ fontFamily: T.mont, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </text>
      </svg>
    </div>
  )
}

/* ─── GoldRule ─── */
function GoldRule() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}44, transparent)`, margin: '14px 0' }} />
}

/* ─── Main ─── */
export default function EmailDetail({ email, onClose }) {
  if (!email) return null

  const isSpam = email.prediction === 'spam'
  const prob   = email.probability
  const accent = isSpam ? (prob > 0.8 ? T.red : T.warn) : T.grnL
  const accentBg = `${accent}14`

  return (
    <AnimatePresence>
      <motion.div
        key="detail"
        initial={{ opacity: 0, x: 24, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: T.bCard,
          border: `1px solid ${T.bdrG}`,
          borderRadius: 4,
          padding: 24,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 200px)',
          position: 'sticky',
          top: 90,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          fontFamily: T.mont,
          /* Top accent */
          borderTop: `2px solid ${accent}`,
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: 3,
              background: accentBg,
              border: `1px solid ${accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isSpam
                ? <AlertTriangle size={14} color={accent} />
                : <CheckCircle   size={14} color={accent} />
              }
            </div>
            <span style={{
              fontWeight: 800,
              fontSize: '0.78rem',
              color: accent,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {isSpam ? 'Spam Detected' : 'Looks Safe'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#1A1A1A',
              border: `1px solid ${T.bdrG}`,
              borderRadius: 3,
              cursor: 'pointer',
              padding: '5px 7px',
              color: `${T.crmD}88`,
              display: 'flex',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdrG; e.currentTarget.style.color = `${T.crmD}88` }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Subject ── */}
        <h3 style={{
          fontFamily: T.mont,
          fontWeight: 700,
          fontSize: '0.95rem',
          lineHeight: 1.5,
          color: accent,
          marginBottom: 14,
        }}>
          {email.subject}
        </h3>

        <GoldRule />

        {/* ── Meta ── */}
        <div style={{
          background: '#1A1A1A',
          borderRadius: 3,
          border: `1px solid ${T.bdrG}`,
          padding: '12px 14px',
          marginBottom: 16,
          display: 'flex', flexDirection: 'column', gap: 7,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: T.crmD }}>
            <User size={12} color={`${T.gold}88`} />
            <span style={{ fontWeight: 600 }}>{email.sender}</span>
          </div>
          {email.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: T.crmD, opacity: 0.7 }}>
              <Calendar size={12} color={`${T.gold}88`} />
              <span>{email.date}</span>
            </div>
          )}
        </div>

        {/* ── Risk meter ── */}
        <div style={{
          background: '#111111',
          border: `1px solid ${T.bdrG}`,
          borderRadius: 4,
          padding: '18px 14px',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '0.6rem',
            color: `${T.gold}99`,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: 8,
          }}>
            ◆ Spam Risk Score
          </div>
          <ArcMeter prob={prob} />
        </div>

        {/* ── LIME / Key words ── */}
        {email.explanation && email.explanation.length > 0 && (
          <div style={{
            background: accentBg,
            border: `1px solid ${accent}25`,
            borderRadius: 4,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Brain size={13} color={accent} />
              <span style={{
                fontWeight: 800,
                fontSize: '0.65rem',
                color: accent,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {email.explain_method === 'lime' ? 'LIME Explanation' : 'Key Words'}
              </span>
              <span style={{
                fontSize: '0.58rem',
                padding: '2px 8px',
                borderRadius: 2,
                background: `${T.gold}18`,
                border: `1px solid ${T.gold}33`,
                color: T.gold,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {email.explain_method === 'lime' ? 'AI' : 'TF-IDF'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {email.explanation.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 320 }}
                  style={{
                    display: 'inline-block',
                    padding: '4px 11px',
                    borderRadius: 2,
                    background: `${accent}18`,
                    border: `1px solid ${accent}35`,
                    color: accent,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* ── Snippet ── */}
        {email.snippet && (
          <>
            <GoldRule />
            <div style={{
              background: '#111111',
              border: `1px solid ${T.bdr}`,
              borderRadius: 3,
              padding: 14,
            }}>
              <div style={{
                fontSize: '0.6rem',
                color: `${T.gold}88`,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 8,
              }}>
                ◆ Preview
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: T.crmD,
                lineHeight: 1.75,
                fontFamily: T.mont,
                fontWeight: 400,
                opacity: 0.8,
              }}>
                {email.snippet}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}