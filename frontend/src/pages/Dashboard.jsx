import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Shield, AlertTriangle, CheckCircle, RefreshCw,
  LogOut, Search, X, Inbox, ChevronLeft, ChevronRight,
  Brain, Sparkles, ChevronDown,
} from 'lucide-react'
import { useUser }         from '../hooks/useUser.js'
import StatsCard           from '../components/StatsCard.jsx'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mailji.onrender.com'
import EmailRow            from '../components/EmailRow.jsx'
import EmailDetail         from '../components/EmailDetail.jsx'
import LoadingSkeleton     from '../components/LoadingSkeleton.jsx'
import SpamDonut           from '../components/SpamDonut.jsx'

/* ── Theme tokens ── */
const T = {
  black:  '#0A0A0A',
  bCard:  '#141414',
  bSoft:  '#1A1A1A',
  bMid:   '#111111',
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

const FILTER_OPTIONS = ['All', 'Spam', 'Safe']
const PAGE_SIZES     = [10, 20, 30, 50]

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.3 } },
}

/* ── Small helpers ── */
function GoldRule() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}44, transparent)`, margin: '12px 0' }} />
}

function GhostBtn({ onClick, disabled, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 3,
        background: 'transparent',
        border: `1px solid ${T.bdrG}`,
        color: T.crmD, cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.78rem', fontFamily: T.mont, fontWeight: 600,
        letterSpacing: '0.04em', transition: 'all 0.15s',
        opacity: disabled ? 0.35 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdrG; e.currentTarget.style.color = T.crmD }}
    >
      {children}
    </button>
  )
}

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const [emails,        setEmails]        = useState([])
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [filter,        setFilter]        = useState('All')
  const [search,        setSearch]        = useState('')
  const [stats,         setStats]         = useState({ total: 0, spam_count: 0, ham_count: 0 })
  const [modelInfo,     setModelInfo]     = useState({ source: '', lime: false })
  const [pageSize,      setPageSize]      = useState(20)
  const [pageIndex,     setPageIndex]     = useState(0)
  const [useLime,       setUseLime]       = useState(false)
  const [sizeOpen,      setSizeOpen]      = useState(false)

  const offset = pageIndex * pageSize

  useEffect(() => { if (!user) navigate('/') }, [user])

  const fetchEmails = useCallback(async () => {
    if (!user?.user_id) return
    setLoading(true); setError(null); setSelectedEmail(null)
    try {
      const params = new URLSearchParams({ limit: pageSize, offset, use_lime: useLime })
      const res    = await fetch(`${BACKEND_URL}/emails/${user.user_id}?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data   = await res.json()
      setEmails(data.emails || [])
      setStats({ total: data.total, spam_count: data.spam_count, ham_count: data.ham_count })
      setModelInfo({ source: data.model_source || '', lime: data.lime_used || false })
    } catch {
      setError('Could not connect to backend. Make sure it\'s running on port 8000.')
    } finally {
      setLoading(false)
    }
  }, [user, pageSize, offset, useLime])

  useEffect(() => { fetchEmails() }, [fetchEmails])

  const filtered = emails.filter(e => {
    const matchFilter =
      filter === 'All'  ? true :
      filter === 'Spam' ? e.prediction === 'spam' :
      e.prediction === 'ham'
    const q = search.toLowerCase()
    const matchSearch = !q || e.subject.toLowerCase().includes(q) || e.sender.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const spamRate = stats.total ? Math.round(stats.spam_count / stats.total * 100) : 0

  if (!user) return null

  return (
    <motion.div
      variants={pageVariants}
      initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: T.black, display: 'flex', flexDirection: 'column', fontFamily: T.mont }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px }
        ::-webkit-scrollbar-track { background: #0A0A0A }
        ::-webkit-scrollbar-thumb { background: #B8860B }
      `}</style>

      {/* ════════════════ NAVBAR ════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.bdrG}`,
        padding: '0 28px',
        height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/logo-white.png"
            alt="MailJi"
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />

          {/* Status badges */}
          <div style={{ display: 'flex', gap: 6 }}>
            {modelInfo.source && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 9px', borderRadius: 2,
                  background: modelInfo.source === 'pkl' ? `${T.grnL}18` : `${T.warn}18`,
                  border: `1px solid ${modelInfo.source === 'pkl' ? T.grnL : T.warn}35`,
                  color: modelInfo.source === 'pkl' ? T.grnL : T.warn,
                  fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >
                {modelInfo.source === 'pkl' ? '⚡ PKL' : '↻ Memory'}
              </motion.span>
            )}
            {modelInfo.lime && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 9px', borderRadius: 2,
                  background: `${T.gold}18`,
                  border: `1px solid ${T.gold}35`,
                  color: T.gold,
                  fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >
                <Brain size={9} /> LIME
              </motion.span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user.picture ? (
            <img src={user.picture} alt={user.name} style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `1px solid ${T.bdrG}`,
            }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `${T.gold}18`,
              border: `1px solid ${T.bdrG}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail size={14} color={T.gold} />
            </div>
          )}
          <span style={{ fontSize: '0.8rem', color: T.crmD, fontWeight: 600 }}>{user.name}</span>
          <GhostBtn
            onClick={async () => { await logout(); navigate('/') }}
            style={{ padding: '7px 14px', fontSize: '0.76rem' }}
          >
            <LogOut size={13} /> Logout
          </GhostBtn>
        </div>
      </header>

      {/* ════════════════ MAIN ════════════════ */}
      <div style={{ flex: 1, padding: '24px 28px', maxWidth: 1380, margin: '0 auto', width: '100%' }}>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
          <StatsCard icon={Inbox}         label="Scanned"     value={stats.total}       color={T.gold}  delay={0}    />
          <StatsCard icon={AlertTriangle} label="Spam"        value={stats.spam_count}  color={T.red}   delay={0.07} />
          <StatsCard icon={CheckCircle}   label="Safe"        value={stats.ham_count}   color={T.grnL}  delay={0.14} />
          <StatsCard icon={Shield}        label="Spam Rate"   value={`${spamRate}%`}    color={T.warn}  delay={0.21} />
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedEmail ? '1fr 380px' : '1fr', gap: 20 }}>

          {/* ── Left panel ── */}
          <div>

            {/* Sidebar card (donut + controls) */}
            <div style={{
              background: T.bCard,
              border: `1px solid ${T.bdrG}`,
              borderRadius: 4,
              padding: '20px 22px',
              marginBottom: 18,
              display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center',
            }}>
              {/* Donut */}
              {stats.total > 0 && (
                <div style={{ minWidth: 160, flex: '0 0 160px' }}>
                  <SpamDonut spamCount={stats.spam_count} hamCount={stats.ham_count} />
                </div>
              )}

              {/* Controls */}
              <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Page size */}
                <div>
                  <div style={{ fontSize: '0.6rem', color: `${T.gold}88`, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                    Emails per page
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {PAGE_SIZES.map(s => (
                      <button key={s} onClick={() => { setPageSize(s); setPageIndex(0) }}
                        style={{
                          padding: '6px 12px', borderRadius: 3, cursor: 'pointer',
                          background: s === pageSize ? `${T.gold}18` : 'transparent',
                          border: `1px solid ${s === pageSize ? T.gold : T.bdrG}`,
                          color: s === pageSize ? T.gold : T.crmD,
                          fontSize: '0.76rem', fontFamily: T.mont, fontWeight: 700,
                          transition: 'all 0.15s',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LIME toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    onClick={() => setUseLime(v => !v)}
                    style={{
                      width: 40, height: 20, borderRadius: 10,
                      background: useLime ? `${T.gold}` : T.bdr,
                      border: `1px solid ${useLime ? T.goldD : T.bdr}`,
                      cursor: 'pointer', position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 2, left: useLime ? 22 : 2,
                      width: 14, height: 14, borderRadius: '50%',
                      background: useLime ? T.black : `${T.crmD}55`,
                      transition: 'left 0.2s',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.crmD, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Brain size={12} color={useLime ? T.gold : `${T.crmD}44`} />
                      LIME Explanations
                    </div>
                    <div style={{ fontSize: '0.62rem', color: `${T.crmD}55`, marginTop: 1 }}>Slower but more accurate</div>
                  </div>
                </div>

                {/* Refresh */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <GhostBtn onClick={fetchEmails} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                    <RefreshCw size={13} className={loading ? 'spin' : ''} />
                    {loading ? 'Scanning…' : 'Refresh'}
                  </GhostBtn>
                </div>
              </div>
            </div>

            {/* Search + filter row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}
            >
              {/* Search input */}
              <div style={{
                flex: 1, minWidth: 200,
                display: 'flex', alignItems: 'center', gap: 10,
                background: T.bCard,
                border: `1.5px solid ${T.bdrG}`,
                borderRadius: 3, padding: '10px 14px',
                transition: 'border-color 0.15s',
              }}
                onFocus={e => e.currentTarget.style.borderColor = T.gold}
                onBlur={e  => e.currentTarget.style.borderColor = T.bdrG}
              >
                <Search size={14} color={`${T.gold}66`} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search subject or sender…"
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    color: T.cream, fontSize: '0.84rem',
                    width: '100%', fontFamily: T.mont,
                  }}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.crmD}66`, padding: 0, display: 'flex' }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 6 }}>
                {FILTER_OPTIONS.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{
                      padding: '9px 16px', borderRadius: 3, cursor: 'pointer',
                      border: `1px solid ${f === filter ? T.gold : T.bdrG}`,
                      background: f === filter ? `${T.gold}14` : 'transparent',
                      color: f === filter ? T.gold : T.crmD,
                      fontSize: '0.78rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s', fontFamily: T.mont,
                      letterSpacing: '0.04em',
                    }}>
                    {f === 'Spam' && <AlertTriangle size={12} />}
                    {f === 'Safe' && <CheckCircle   size={12} />}
                    {f}
                  </button>
                ))}
              </div>

              {selectedEmail && (
                <GhostBtn onClick={() => setSelectedEmail(null)} style={{ padding: '9px 14px' }}>
                  <X size={13} /> Close
                </GhostBtn>
              )}
            </motion.div>

            {/* Meta bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8, padding: '0 4px',
              fontSize: '0.7rem', color: `${T.crmD}66`, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              <span>
                {!loading && `${filtered.length} email${filtered.length !== 1 ? 's' : ''} · range #${offset + 1}–#${offset + pageSize}`}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <GhostBtn onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0 || loading}
                  style={{ padding: '4px 10px', fontSize: '0.7rem', gap: 4 }}>
                  <ChevronLeft size={11} /> Prev
                </GhostBtn>
                <GhostBtn onClick={() => setPageIndex(p => p + 1)} disabled={loading}
                  style={{ padding: '4px 10px', fontSize: '0.7rem', gap: 4 }}>
                  Next <ChevronRight size={11} />
                </GhostBtn>
              </div>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    background: `${T.red}14`,
                    border: `1px solid ${T.red}30`,
                    borderRadius: 4, padding: '12px 18px', marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <AlertTriangle size={15} color={T.red} />
                  <span style={{ color: T.red, fontSize: '0.82rem', fontWeight: 600 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email list */}
            <div style={{
              background: T.bCard,
              border: `1px solid ${T.bdrG}`,
              borderRadius: 4,
              overflow: 'hidden',
              minHeight: 220,
            }}>
              {loading ? (
                <LoadingSkeleton count={Math.min(pageSize, 10)} />
              ) : filtered.length === 0 ? (
                <div style={{ padding: 64, textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 3,
                    background: `${T.gold}12`,
                    border: `1px solid ${T.bdrG}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Mail size={22} color={`${T.gold}55`} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: T.crmD, marginBottom: 6, fontFamily: T.mont }}>
                    No emails found
                  </div>
                  <div style={{ fontSize: '0.76rem', color: `${T.crmD}55` }}>
                    Try adjusting your filter or scan a different range.
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px 8px' }}>
                  {filtered.map((email, i) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      index={i}
                      onClick={setSelectedEmail}
                      isSelected={selectedEmail?.id === email.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom pagination */}
            {!loading && filtered.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, alignItems: 'center' }}>
                <GhostBtn onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0}>
                  <ChevronLeft size={14} /> Previous
                </GhostBtn>
                <span style={{
                  padding: '7px 18px', borderRadius: 3,
                  background: `${T.gold}10`,
                  border: `1px solid ${T.bdrG}`,
                  fontSize: '0.76rem', color: T.gold,
                  fontFamily: T.mont, fontWeight: 800, letterSpacing: '0.06em',
                }}>
                  Page {pageIndex + 1}
                </span>
                <GhostBtn onClick={() => setPageIndex(p => p + 1)} disabled={loading}>
                  Next <ChevronRight size={14} />
                </GhostBtn>
              </div>
            )}
          </div>

          {/* ── Email detail panel ── */}
          {selectedEmail && (
            <EmailDetail email={selectedEmail} onClose={() => setSelectedEmail(null)} />
          )}
        </div>
      </div>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{
        borderTop: `1px solid ${T.bdrG}`,
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${T.gold}14)` }} />
        <p style={{
          fontSize: '0.62rem', color: `${T.crmD}30`,
          fontFamily: T.mont, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          © {new Date().getFullYear()} MailJi · AI-Powered Spam Raksha · Free & Private ·
        </p>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${T.gold}14, transparent)` }} />
      </footer>
    </motion.div>
  )
}
