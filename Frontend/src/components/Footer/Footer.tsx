import React from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Container from '../Container/Container'
import Logo from '../Logo'

function Footer() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'

  if (isAuthRoute) {
    return (
      <footer className="relative z-10 border-t border-outline-variant/60 bg-surface-container">
        <Container className="flex flex-col gap-3 py-4 text-[10px] font-medium uppercase tracking-[0.28em] text-on-surface-variant/75 md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 Aniverse Manuscript. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Manuscript</span>
            <Link className="transition-colors hover:text-on-surface" to="/all-posts">
              Archive
            </Link>
            <span>Legal</span>
          </div>
        </Container>
      </footer>
    )
  }

  return (
    <footer className="border-t border-outline-variant/60 bg-surface-container-low">
      <Container className="flex flex-col gap-4 py-section md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo width="132px" />
          <p className="max-w-md text-sm leading-6 text-on-surface-variant">
            Long-form theories, editorial takes, and archive notes built for late-night reading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-medium uppercase tracking-[0.28em] text-on-surface-variant/80">
          <span>Privacy</span>
          <Link className="transition-colors hover:text-on-surface" to="/all-posts">
            Archive
          </Link>
          <span>Rules</span>
          <span>API</span>
          <span className="text-on-surface-variant/50">(c) 2026 Aniverse</span>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
