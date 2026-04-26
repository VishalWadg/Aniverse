import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import Container from '../Container/Container'
import Logo from '../Logo'
import LogoutBtn from './LogoutBtn'

const navItems = [
  { name: 'Home', slug: '/' },
  { name: 'All Posts', slug: '/all-posts' },
]

function Header() {
  const authStatus = useAppSelector((state) => state.auth.status)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'
  const navControlClass = 'h-10'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchValue(params.get('q') ?? '')
  }, [location.search])

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname, location.search])

  const handleSearch = (event) => {
    event.preventDefault()
    const nextQuery = searchValue.trim()
    const params = new URLSearchParams(location.search)

    if (nextQuery) {
      params.set('q', nextQuery)
    } else {
      params.delete('q')
    }

    const pathname =
      location.pathname === '/' || location.pathname === '/all-posts'
        ? location.pathname
        : '/all-posts'

    navigate({
      pathname,
      search: params.toString() ? `?${params.toString()}` : '',
    })
  }

  if (isAuthRoute) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0b0b]/90 backdrop-blur-xl">
        <Container className="py-4">
          <div className="flex min-h-10 items-center justify-between gap-6 shrink-0">
            <Link to="/" className="shrink-0">
              <Logo width="168px" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                className={`${navControlClass} rounded-none border border-white/10 bg-transparent px-4 text-[#d6d6d6] hover:bg-white/[0.04] hover:text-white`}
              >
                <Link to="/">Home</Link>
              </Button>

              <Button
                asChild
                className={`${navControlClass} rounded-none bg-[#ff453a] px-5 font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff5f55]`}
              >
                <Link to={location.pathname === '/login' ? '/signup' : '/login'}>
                  {location.pathname === '/login' ? 'Sign Up' : 'Log In'}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0b0b]/90 backdrop-blur-xl">
      <Container className="py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-6 shrink-0">
            <Link to="/" className="shrink-0">
              <Logo width="168px" />
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <Button
                asChild
                className="rounded-none bg-[#ff453a] px-5 font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff5f55]"
              >
                <Link to={authStatus ? '/add-post' : '/signup'}>Write</Link>
              </Button>

              <button
                type="button"
                aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="inline-flex size-10 items-center justify-center border border-white/10 text-[#d6d6d6] transition hover:bg-white/[0.04] hover:text-white"
              >
                {isMobileNavOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
              </button>
            </div>
          </div>

          <div className="hidden flex-1 flex-col gap-4 lg:flex lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.slug}
                  className={cn(
                    'text-sm font-black uppercase tracking-[0.18em] transition-colors',
                    location.pathname === item.slug
                      ? 'text-[#ff453a]'
                      : 'text-[#d5d5d5] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end lg:flex-none">
              <form
                onSubmit={handleSearch}
                className="flex w-full max-w-md items-center gap-2"
              >
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#5f5f5f]" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search the archives..."
                    className={`${navControlClass} rounded-none border-white/10 bg-black/40 pr-4 pl-11 text-[11px] font-medium uppercase tracking-[0.28em] placeholder:text-[#5f5f5f]`}
                  />
                </div>
              </form>

              <div className="flex items-center gap-2 sm:gap-3">
                {!authStatus && (
                  <Button
                    asChild
                    variant="ghost"
                    className={`${navControlClass} rounded-none border border-white/10 bg-transparent px-4 text-[#d6d6d6] hover:bg-white/[0.04] hover:text-white`}
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                )}

                <Button
                  asChild
                  className="hidden rounded-none bg-[#ff453a] px-5 font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff5f55] lg:inline-flex"
                >
                  <Link to={authStatus ? '/add-post' : '/signup'}>
                    Write a Theory
                  </Link>
                </Button>

                {authStatus && <LogoutBtn />}
              </div>
            </div>
          </div>

          {isMobileNavOpen ? (
            <div className="border-t border-white/8 pt-4 lg:hidden">
              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.slug}
                    className={cn(
                      'text-sm font-black uppercase tracking-[0.18em] transition-colors',
                      location.pathname === item.slug
                        ? 'text-[#ff453a]'
                        : 'text-[#d5d5d5] hover:text-white'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <form onSubmit={handleSearch} className="mt-4 flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#5f5f5f]" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search the archives..."
                    className={`${navControlClass} rounded-none border-white/10 bg-black/40 pr-4 pl-11 text-[11px] font-medium uppercase tracking-[0.28em] placeholder:text-[#5f5f5f]`}
                  />
                </div>
              </form>

              <div className="mt-4 flex flex-col gap-2">
                {!authStatus && (
                  <Button
                    asChild
                    variant="ghost"
                    className={`${navControlClass} w-full rounded-none border border-white/10 bg-transparent px-4 text-[#d6d6d6] hover:bg-white/[0.04] hover:text-white`}
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                )}

                <Button
                  asChild
                  className={`${navControlClass} w-full rounded-none bg-[#ff453a] px-5 font-black uppercase tracking-[0.18em] text-white hover:bg-[#ff5f55]`}
                >
                  <Link to={authStatus ? '/add-post' : '/signup'}>
                    Write a Theory
                  </Link>
                </Button>

                {authStatus && <LogoutBtn />}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </header>
  )
}

function SearchIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function MenuIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

export default Header
