import { motion } from 'framer-motion'

/* ── Theme tokens ── */
const T = {
  black:  '#0A0A0A',
  bCard:  '#141414',
  bSoft:  '#1A1A1A',
  bdr:    '#252525',
  bdrG:   '#B8860B33',
  gold:   '#C9A84C',
  goldD:  '#8A6A20',
  cream:  '#F5EDD6',
  crmD:   '#C8BA9A',
  mont:   "'Montserrat',sans-serif",
}

export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div style={{ padding: '8px 0', background: T.black }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
        @keyframes goldShimmer {
          0%   { background-position: -400px 0 }
          100% { background-position:  400px 0 }
        }
        .gold-shimmer {
          background: linear-gradient(
            90deg,
            ${T.bSoft} 25%,
            #B8860B22 50%,
            ${T.bSoft} 75%
          );
          background-size: 800px 100%;
          animation: goldShimmer 1.8s ease-in-out infinite;
          border-radius: 4px;
        }
      `}</style>

      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr auto',
            gap: 14,
            padding: '14px 18px',
            marginBottom: 2,
            alignItems: 'center',
            borderBottom: `1px solid ${T.bdrG}`,
          }}
        >
          <div className="gold-shimmer" style={{ width: 22, height: 22, borderRadius: '50%' }} />

          <div>
            <div className="gold-shimmer" style={{ height: 13, width: `${55 + (i % 4) * 10}%`, marginBottom: 8 }} />
            <div className="gold-shimmer" style={{ height: 10, width: `${25 + (i % 3) * 8}%` }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div className="gold-shimmer" style={{ height: 20, width: 72, borderRadius: 2 }} />
            <div className="gold-shimmer" style={{ height: 4,  width: 72, borderRadius: 2 }} />
          </div>
        </motion.div>
      ))}

      <div style={{
        textAlign: 'center',
        marginTop: 24,
        padding: '12px',
        fontFamily: T.mont,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: T.gold,
        opacity: 0.7,
      }}>
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ◆ Scanning your inbox…
        </motion.span>
      </div>
    </div>
  )
}