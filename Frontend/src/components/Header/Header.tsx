import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import Container from '../Container/Container'
import Logo from '../Logo'
import LogoutBtn from './LogoutBtn'
import UserAvatar from '../User/UserAvatar'
import { normalizeBrandHex, useTheme } from '../ThemeProvider'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

const navItems = [
  { name: 'Home', slug: '/' },
  { name: "Trash Bin", slug: "/admin" }
]

const headerVariants = {
  hidden: {
    y: "-100%",
    opacity: 0,
    pointerEvents: "none",
  },
  visible: {
    y: 0,
    opacity: 1, 
    pointerEvents: "auto", 
  },
};

type ThemeMode = 'light' | 'dark' | 'system'

// Extracted so we don't paste the same ~60 lines into 3 popovers.
function SettingsPanelContent({
  theme,
  setTheme,
  brandColor,
  setBrandColor,
  resetBrandColor,
  colorInput,
  setColorInput,
  colorError,
  setColorError,
  commitBrandColor,
}: {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  brandColor: string
  setBrandColor: (color: string) => void
  resetBrandColor: () => void
  colorInput: string
  setColorInput: (value: string) => void
  colorError: string
  setColorError: (value: string) => void
  commitBrandColor: () => void
}) {
  return (
    <>
      <h3 className="text-xs font-black uppercase tracking-[0.16em] text-on-surface mb-3">Settings</h3>

      {/* Mode Selector */}
      <div className="mb-4">
        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant mb-2">Appearance</span>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTheme(m)}
              className={`h-8 text-[10px] font-black uppercase tracking-[0.08em] rounded-control border transition-all cursor-pointer ${
                theme === m
                  ? 'bg-primary text-on-primary border-transparent shadow-sm'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Color Selector */}
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant mb-2">Accent Color</span>
        <div className="flex items-center gap-3">
          <div className="relative size-8 rounded-full border border-outline-variant shadow-inner transition-colors duration-300 shrink-0 overflow-hidden">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => {
                setColorInput(e.target.value);
                setColorError('');
                setBrandColor(e.target.value);
              }}
              className="absolute inset-0 size-full scale-150 cursor-pointer opacity-0"
              aria-label="Accent color picker"
            />
            <div
              className="size-full"
              style={{ backgroundColor: brandColor }}
            />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => {
                setColorInput(e.target.value);
                setColorError('');
              }}
              onBlur={commitBrandColor}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitBrandColor();
                }
              }}
              placeholder="#769CDF"
              aria-invalid={Boolean(colorError)}
              className="h-8 w-full rounded-control border border-outline-variant bg-surface-container px-3 text-xs font-mono text-on-surface outline-none focus:border-primary aria-invalid:border-error"
            />
          </div>
        </div>
        {colorError ? (
          <p className="mt-2 text-xs font-medium text-error">{colorError}</p>
        ) : null}
        <button
          type="button"
          onClick={resetBrandColor}
          className="mt-3 h-8 rounded-control border border-outline-variant px-control-x text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:border-outline hover:bg-surface-container hover:text-on-surface"
        >
          Reset Accent
        </button>
      </div>
    </>
  )
}

function Header() {
  const authStatus = useAppSelector((state) => state.auth.status)
  const currentUser = useAppSelector((state) => state.auth.userData)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Each trigger location owns its own popover state — no shared boolean,
  // so there's no way for one instance's logic to react to another's DOM.
  const [isAuthSettingsOpen, setIsAuthSettingsOpen] = useState(false)
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false)
  const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false)

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'
  const navControlClass = 'h-control-h'
  const userRole = useAppSelector((state) => state.auth.userData?.role);
  const TOP_THRESHOLD = 80;

  // Dynamic Theme API
  const { theme, setTheme, brandColor, setBrandColor, resetBrandColor } = useTheme();

  const [colorInput, setColorInput] = useState(brandColor);
  const [colorError, setColorError] = useState('');

  const { scrollY } = useScroll();
  const [headerHidden, setHeaderHidden] = useState(false);

  const headerHiddenRef = React.useRef(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // 1. Guard `headerHidden` visibility (uses our unified threshold of 80px)
    if (latest < TOP_THRESHOLD) {
      if (headerHiddenRef.current) {
        headerHiddenRef.current = false;
        setHeaderHidden(false);
      }
      return;
    }

    // 2. Hide on scroll down, show on scroll up (with a 10px buffer)
    if (latest > previous && latest > 120) {
      if (!headerHiddenRef.current) {
        headerHiddenRef.current = true;
        setHeaderHidden(true);
        setIsAuthSettingsOpen(false);
        setIsMobileSettingsOpen(false);
        setIsDesktopSettingsOpen(false);
      }
    } else if (previous - latest > 10) {
      if (headerHiddenRef.current) {
        headerHiddenRef.current = false;
        setHeaderHidden(false);
      }
    }
  });

  useEffect(() => {
    setColorInput(brandColor);
    setColorError('');
  }, [brandColor]);

  const navRoutes = navItems.filter((item) => {
    if (item.slug === "/admin") {
      return userRole === "ADMIN"
    }
    return true;
  })

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

  const commitBrandColor = () => {
    const normalizedColor = normalizeBrandHex(colorInput);

    if (!normalizedColor) {
      setColorError('Use a valid hex color.');
      return;
    }

    setColorInput(normalizedColor);
    setColorError('');
    setBrandColor(normalizedColor);
  }

  const settingsPanelClassName =
    "w-[min(18rem,calc(100vw-2rem))] rounded-card border border-outline-variant bg-surface-container-highest p-card shadow-elevation-2"

  const settingsPanelProps = {
    theme,
    setTheme,
    brandColor,
    setBrandColor,
    resetBrandColor,
    colorInput,
    setColorInput,
    colorError,
    setColorError,
    commitBrandColor,
  }

  if (isAuthRoute) {
    return (
      <motion.header
        variants={headerVariants}
        animate={headerHidden ? "hidden" : "visible"}
        transition={{ type: "decay", duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container/90 backdrop-blur-xl">
        <Container className="py-4">
          <div className="flex min-h-10 items-center justify-between gap-3 sm:gap-6 shrink-0">
            <Link to="/" className="w-32 sm:w-40 shrink-0">
              <Logo width="100%" />
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                className={`${navControlClass} hidden sm:inline-flex rounded-none border border-outline-variant bg-transparent px-3 sm:px-4 text-on-surface-variant hover:bg-surface-container hover:text-on-surface`}
              >
                <Link to="/">Home</Link>
              </Button>

              <Button
                asChild
                className={`${navControlClass} rounded-none px-3 sm:px-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.18em]`}
              >
                <Link to={location.pathname === '/login' ? '/signup' : '/login'}>
                  {location.pathname === '/login' ? 'Sign Up' : 'Log In'}
                </Link>
              </Button>

              {/* Theme Settings Control */}
              <Popover open={isAuthSettingsOpen} onOpenChange={setIsAuthSettingsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-9 sm:size-10 items-center justify-center border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded-control cursor-pointer"
                    aria-label="Theme settings"
                  >
                    <SettingsIcon className={`size-4 sm:size-5 transition-transform duration-300 ${isAuthSettingsOpen ? 'rotate-45' : ''}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={8} className={settingsPanelClassName}>
                  <SettingsPanelContent {...settingsPanelProps} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Container>
      </motion.header>
    )
  }

  return (
    <motion.header
      variants={headerVariants}
      animate={headerHidden ? "hidden" : "visible"}
      transition={{ type: "decay", duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container/90 backdrop-blur-xl">
      <Container className="py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3 sm:gap-6 shrink-0">
            <Link to="/" className="w-32 sm:w-40 shrink-0">
              <Logo width="100%" />
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
              <Button
                asChild
                className="rounded-none px-3 sm:px-5 font-black uppercase tracking-[0.12em] sm:tracking-[0.18em]"
              >
                <Link to={authStatus ? '/add-post' : '/signup'}>Write</Link>
              </Button>

              {/* Theme Settings Control Mobile */}
              <Popover open={isMobileSettingsOpen} onOpenChange={setIsMobileSettingsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded-control cursor-pointer"
                    aria-label="Theme settings"
                  >
                    <SettingsIcon className={`size-5 transition-transform duration-300 ${isMobileSettingsOpen ? 'rotate-45' : ''}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={8} className={settingsPanelClassName}>
                  <SettingsPanelContent {...settingsPanelProps} />
                </PopoverContent>
              </Popover>

              <button
                type="button"
                aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="inline-flex size-10 items-center justify-center border border-outline-variant text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
              >
                {isMobileNavOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
              </button>
            </div>
          </div>

          <div className="hidden flex-1 flex-col gap-4 lg:flex lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {navRoutes.map((item) => (
                <Link
                  key={item.name}
                  to={item.slug}
                  className={cn(
                    'text-sm font-black uppercase tracking-[0.18em] transition-colors',
                    location.pathname === item.slug
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
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
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search the archives..."
                    className={`${navControlClass} rounded-none pr-4 pl-11 text-[11px] font-medium uppercase tracking-[0.28em]`}
                  />
                </div>
              </form>

              <div className="flex items-center gap-2 sm:gap-3">
                {!authStatus && (
                  <Button
                    asChild
                    variant="ghost"
                    className={`${navControlClass} rounded-none border border-outline-variant bg-transparent px-4 text-on-surface-variant hover:bg-surface-container hover:text-on-surface`}
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                )}

                <Button
                  asChild
                  className="hidden rounded-none px-5 font-black uppercase tracking-[0.18em] lg:inline-flex"
                >
                  <Link to={authStatus ? '/add-post' : '/signup'}>
                    Write a Theory
                  </Link>
                </Button>

                {authStatus && currentUser && (
                  <Link
                    to={`/users/${currentUser.username}`}
                    className="hidden items-center gap-3 border border-outline-variant bg-surface-container/50 px-3 py-2 transition hover:bg-surface-container md:inline-flex"
                  >
                    <UserAvatar
                      userName={currentUser.name || currentUser.username}
                      avatarSeed={currentUser.username}
                      profileUrl={currentUser.profilePic}
                      size="sm"
                      className="size-9 data-[size=sm]:size-9"
                    />

                    <span className="min-w-0 text-left">
                      <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-on-surface-variant">
                        Profile
                      </span>
                      <span className="block max-w-[9rem] truncate text-sm font-semibold text-on-surface">
                        {currentUser.username}
                      </span>
                    </span>
                  </Link>
                )}

                {authStatus && <LogoutBtn />}

                {/* Theme Settings Control Desktop */}
                <Popover open={isDesktopSettingsOpen} onOpenChange={setIsDesktopSettingsOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hidden lg:inline-flex size-10 items-center justify-center border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded-control cursor-pointer"
                      aria-label="Theme settings"
                    >
                      <SettingsIcon className={`size-5 transition-transform duration-300 ${isDesktopSettingsOpen ? 'rotate-45' : ''}`} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={8} className={settingsPanelClassName}>
                    <SettingsPanelContent {...settingsPanelProps} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {isMobileNavOpen ? (
            <div className="border-t border-outline-variant pt-4 lg:hidden">
              <nav className="flex flex-col gap-3">
                {navRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.slug}
                    className={cn(
                      'text-sm font-black uppercase tracking-[0.18em] transition-colors',
                      location.pathname === item.slug
                        ? 'text-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <form onSubmit={handleSearch} className="mt-4 flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search the archives..."
                    className={`${navControlClass} rounded-none pr-4 pl-11 text-[11px] font-medium uppercase tracking-[0.28em]`}
                  />
                </div>
              </form>

              <div className="mt-4 flex flex-col gap-2">
                {!authStatus && (
                  <Button
                    asChild
                    variant="ghost"
                    className={`${navControlClass} w-full rounded-none border border-outline-variant bg-transparent px-4 text-on-surface-variant hover:bg-surface-container hover:text-on-surface`}
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                )}

                <Button
                  asChild
                  className={`${navControlClass} w-full rounded-none px-5 font-black uppercase tracking-[0.18em]`}
                >
                  <Link to={authStatus ? '/add-post' : '/signup'}>
                    Write a Theory
                  </Link>
                </Button>

                {authStatus && currentUser && (
                  <Link
                    to={`/users/${currentUser.username}`}
                    className="flex items-center gap-3 border border-outline-variant bg-surface-container/50 px-3 py-3 transition hover:bg-surface-container"
                  >
                    <UserAvatar
                      userName={currentUser.name || currentUser.username}
                      avatarSeed={currentUser.username}
                      profileUrl={currentUser.profilePic}
                      size="sm"
                      className="size-10 data-[size=sm]:size-10"
                    />

                    <span className="min-w-0 text-left">
                      <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-on-surface-variant">
                        Profile
                      </span>
                      <span className="block truncate text-sm font-semibold text-on-surface">
                        {currentUser.username}
                      </span>
                    </span>
                  </Link>
                )}

                {authStatus && <LogoutBtn />}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </motion.header>
  )
}

function SearchIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function MenuIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

function SettingsIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default Header