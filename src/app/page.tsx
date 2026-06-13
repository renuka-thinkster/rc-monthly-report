'use client'

import { useEffect, useState } from 'react'

type AuthState = 'checking' | 'authed' | 'noauth'

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>('checking')

  // GATE: confirm there is a real session BEFORE showing the dashboard.
  // No session -> bounce to /login. Same check your project already used.
  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        if (cancelled) return
        if (j && j.user && j.user.email) {
          setAuthState('authed')
        } else {
          setAuthState('noauth')
          window.location.href = '/login'
        }
      })
      .catch(() => {
        if (cancelled) return
        setAuthState('noauth')
        window.location.href = '/login'
      })
    return () => { cancelled = true }
  }, [])

  if (authState !== 'authed') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif', color: '#8B3300', fontSize: 14
      }}>
        Checking sign-in…
      </div>
    )
  }

  // Authenticated -> load the client's self-contained report.html (the full
  // dashboard UI + its own logic, talking to /api/data and /api/auth/*).
  return (
    <iframe
      src="/report.html"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0 }}
      title="RC Monthly MIS"
    />
  )
}
