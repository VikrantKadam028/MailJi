import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

/* ── Theme tokens ── */
const T = {
  black:  '#0A0A0A',
  bCard:  '#141414',
  bdrG:   '#B8860B33',
  gold:   '#C9A84C',
  cream:  '#F5EDD6',
  crmD:   '#C8BA9A',
  red:    '#C0392B',
  grn:    '#1A7A4A',
  grnL:   '#4CAF7D',
  mont:   "'Montserrat',sans-serif",
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: T.bCard,
        border: `1px solid ${T.bdrG}`,
        borderRadius: 4,
        padding: '8px 14px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
        fontSize: '0.78rem',
        fontFamily: T.mont,
        fontWeight: 700,
        color: T.cream,
        letterSpacing: '0.04em',
      }}>
        <span style={{ color: payload[0].payload.color, marginRight: 6 }}>◆</span>
        {payload[0].name}: <span style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
      </div>
    )
  }
  return null
}

export default function SpamDonut({ spamCount, hamCount }) {
  const total = spamCount + hamCount
  if (!total) return null

  const data = [
    { name: 'Spam', value: spamCount, color: T.red   },
    { name: 'Safe', value: hamCount,  color: T.grnL  },
  ]

  const spamPct = Math.round((spamCount / total) * 100)

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Donut */}
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={42} outerRadius={60}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationBegin={200}
              animationDuration={900}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center label */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -54%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: T.mont,
          fontWeight: 900,
          fontSize: '1.1rem',
          color: spamPct > 50 ? T.red : T.grnL,
          lineHeight: 1,
        }}>
          {spamPct}%
        </div>
        <div style={{
          fontFamily: T.mont,
          fontWeight: 600,
          fontSize: '0.52rem',
          color: T.crmD,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: 2,
        }}>
          spam
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        marginTop: 6,
      }}>
        {data.map(d => (
          <div key={d.name} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: T.mont, fontSize: '0.66rem',
            fontWeight: 700, color: T.crmD,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <div style={{ width: 7, height: 7, background: d.color, transform: 'rotate(45deg)' }} />
            {d.name} · {d.value}
          </div>
        ))}
      </div>
    </div>
  )
}