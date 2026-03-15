import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'

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
  redL:   '#E07070',
  warn:   '#D97706',
  grn:    '#1A7A4A',
  grnL:   '#4CAF7D',
  mont:   "'Montserrat',sans-serif",
}

function ProbBar({ prob, isSpam }) {
  const color = isSpam
    ? prob > 0.8 ? T.red : T.warn
    : T.grnL

  return (
    <div style={{
      width: 72, height: 4,
      background: '#252525',
      borderRadius: 2,
      marginTop: 5,
      overflow: 'hidden',
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${prob * 100}%` }}
        transition={{ duration: 1, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          boxShadow: `0 0 6px ${color}44`,
        }}
      />
    </div>
  )
}

function Badge({ isSpam, highRisk, prob }) {
  const bg    = isSpam ? (highRisk ? `${T.red}22`  : `${T.warn}22`) : `${T.grnL}18`
  const color = isSpam ? (highRisk ? T.red          : T.warn)       : T.grnL
  const border = `1px solid ${color}44`
  const text  = isSpam ? `${Math.round(prob * 100)}% spam` : 'Safe'

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: 2,
      background: bg,
      border,
      color,
      fontSize: '0.65rem',
      fontFamily: T.mont,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>
      {text}
    </span>
  )
}

export default function EmailRow({ email, index, onClick, isSelected }) {
  const isSpam   = email.prediction === 'spam'
  const prob     = email.probability
  const highRisk = prob > 0.8

  const leftBorderColor = isSpam
    ? (highRisk ? T.red : T.warn)
    : T.grnL

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.4, ease: 'easeOut' }}
      onClick={() => onClick(email)}
      whileHover={{ backgroundColor: '#1A1A1A' }}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        alignItems: 'center',
        gap: 14,
        padding: '13px 18px',
        borderRadius: 3,
        cursor: 'pointer',
        borderLeft: `3px solid ${leftBorderColor}`,
        background: isSelected
          ? `linear-gradient(90deg, ${T.gold}0A, transparent)`
          : 'transparent',
        outline: isSelected ? `1px solid ${T.bdrG}` : '1px solid transparent',
        transition: 'background 0.15s, outline 0.15s',
        marginBottom: 2,
      }}
    >
      {/* Icon */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isSpam
          ? <AlertTriangle size={15} color={highRisk ? T.red : T.warn} strokeWidth={2.2} />
          : <CheckCircle   size={15} color={T.grnL}                    strokeWidth={2.2} />
        }
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: T.mont,
          fontWeight: 600,
          fontSize: '0.855rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isSpam
            ? (highRisk ? T.red : T.warn)
            : T.cream,
          marginBottom: 3,
          letterSpacing: '-0.01em',
        }}>
          {email.subject}
        </div>
        <div style={{
          fontFamily: T.mont,
          fontSize: '0.7rem',
          color: T.crmD,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: 0.6,
          fontWeight: 500,
        }}>
          {email.sender}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <Badge isSpam={isSpam} highRisk={highRisk} prob={prob} />
          <ProbBar prob={prob} isSpam={isSpam} />
        </div>
        <ChevronRight size={13} color={`${T.crmD}44`} />
      </div>
    </motion.div>
  )
}