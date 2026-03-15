import { motion } from 'framer-motion'

/* ── Theme tokens ── */
const T = {
  black:  '#0A0A0A',
  bCard:  '#141414',
  bSoft:  '#1A1A1A',
  bdrG:   '#B8860B33',
  bdr:    '#252525',
  gold:   '#C9A84C',
  goldB:  '#E2B84A',
  cream:  '#F5EDD6',
  crmD:   '#C8BA9A',
  mont:   "'Montserrat',sans-serif",
  corm:   "'Cormorant Garamond',Georgia,serif",
}

export default function StatsCard({ icon: Icon, label, value, color, delay = 0 }) {
  /* For spam/danger colors map to gold accent unless explicitly set */
  const accentColor = color || T.gold

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      style={{
        background: T.bCard,
        border: `1px solid ${T.bdrG}`,
        borderRadius: 4,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: 1,
        minWidth: 140,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`,
      }} />

      {/* Corner diamond */}
      <div style={{
        position: 'absolute',
        top: 10, right: 10,
        width: 5, height: 5,
        background: `${accentColor}40`,
        transform: 'rotate(45deg)',
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44,
        borderRadius: 3,
        background: `${accentColor}12`,
        border: `1px solid ${accentColor}28`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={accentColor} strokeWidth={2} />
      </div>

      {/* Text */}
      <div>
        <div style={{
          fontSize: '0.62rem',
          color: T.crmD,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 4,
          fontFamily: T.mont,
          opacity: 0.7,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: T.mont,
          fontWeight: 900,
          fontSize: '1.7rem',
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {value}
        </div>
      </div>
    </motion.div>
  )
}