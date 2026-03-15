import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const USER_KEY = 'mailji_user'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mailji.onrender.com'

export function useUser() {
  const [user, setUser]           = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const uid     = searchParams.get('user_id')
    const email   = searchParams.get('email')
    const name    = searchParams.get('name')
    const picture = searchParams.get('picture')

    if (uid && email) {
      const u = { user_id: uid, email, name: name || email, picture: picture || '' }
      setUser(u)
      localStorage.setItem(USER_KEY, JSON.stringify(u))
      setSearchParams({})
      return
    }

    const stored = localStorage.getItem(USER_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  const logout = async () => {
    if (user?.user_id) {
      try { await fetch(`${BACKEND_URL}/auth/logout/${user.user_id}`, { method: 'DELETE' }) } catch {}
    }
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return { user, setUser, logout }
}
