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
  { name: 'Home', slug: '/' }
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

  const navRoutes = navItems;

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
              <Link
                to="/"
                className="hidden sm:inline-flex size-9 sm:size-10 items-center justify-center rounded-control border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                aria-label="Home"
              >
                <HomeIcon className="size-4 sm:size-5" />
              </Link>

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
                    className="inline-flex size-9 sm:size-10 items-center justify-center text-on-surface hover:bg-surface-container transition-colors rounded-control cursor-pointer"
                    aria-label="Theme settings"
                  >
                    <PaletteIcon className={`size-4 sm:size-5 transition-transform duration-300 ${isAuthSettingsOpen ? 'rotate-45' : ''}`} />
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
              {authStatus && currentUser && (
                <Link to={`/users/${currentUser.username}`}>
                  <UserAvatar
                    userName={currentUser.name || currentUser.username}
                    avatarSeed={currentUser.username}
                    profileUrl={currentUser.profilePic}
                    size="sm"
                    className="size-10 data-[size=sm]:size-10"
                  />
                </Link>
              )}

              <Link
                to={authStatus ? '/add-post' : '/signup'}
                className="inline-flex size-10 items-center justify-center rounded-control bg-primary text-on-primary transition hover:opacity-90"
                aria-label="Write a theory"
              >
                <QuillIcon className="size-5" />
              </Link>

              <button
                type="button"
                aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="inline-flex size-10 items-center justify-center border border-outline-variant text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface rounded-control"
              >
                {isMobileNavOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
              </button>
            </div>
          </div>

          <div className="hidden flex-1 flex-col gap-4 lg:flex lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-x-2">
              {navRoutes.map((item) => (
                <Link
                  key={item.name}
                  to={item.slug}
                  aria-label={item.name}
                  title={item.name}
                  className={cn(
                    'inline-flex size-10 items-center justify-center rounded-control transition-colors',
                    location.pathname === item.slug
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  {item.name === 'Home' ? <HomeIcon className="size-5" /> : <TrashIcon className="size-5" />}
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

                <Link
                  to={authStatus ? '/add-post' : '/signup'}
                  className="hidden lg:inline-flex size-10 items-center justify-center rounded-control bg-primary text-on-primary transition hover:opacity-90"
                  aria-label="Write a theory"
                >
                  <QuillIcon className="size-5" />
                </Link>

                {authStatus && currentUser && (
                  <Popover open={isDesktopSettingsOpen} onOpenChange={setIsDesktopSettingsOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="hidden md:inline-flex items-center gap-2 rounded-control px-2 py-1 transition-colors hover:bg-surface-container cursor-pointer"
                        aria-label="User menu"
                      >
                        <UserAvatar
                          userName={currentUser.name || currentUser.username}
                          avatarSeed={currentUser.username}
                          profileUrl={currentUser.profilePic}
                          size="sm"
                          className="size-9 data-[size=sm]:size-9"
                        />
                        <span className="max-w-[8rem] truncate text-sm font-semibold text-on-surface">
                          {currentUser.username}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={8} className={`${settingsPanelClassName} p-0 overflow-hidden`}>
                      <div className="flex flex-col">
                        <div className="flex flex-col p-2 gap-1">
                          <Link
                            to={`/users/${currentUser.username}`}
                            onClick={() => setIsDesktopSettingsOpen(false)}
                            className="flex items-center px-3 py-2 rounded-control transition-colors text-sm font-bold uppercase tracking-[0.18em] text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                          >
                            Profile
                          </Link>
                          {userRole === 'ADMIN' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsDesktopSettingsOpen(false)}
                              className="flex items-center px-3 py-2 rounded-control transition-colors text-sm font-bold uppercase tracking-[0.18em] text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                            >
                              Trash Bin
                            </Link>
                          )}
                        </div>

                        <hr className="border-outline-variant" />

                        <div className="p-card">
                          <SettingsPanelContent {...settingsPanelProps} />
                        </div>

                        <hr className="border-outline-variant" />

                        <div className="p-2">
                          <LogoutBtn />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>

          {isMobileNavOpen ? (
            <div className="border-t border-outline-variant pt-4 lg:hidden">
              <nav className="flex flex-col gap-2">
                {navRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.slug}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-control transition-colors text-sm font-bold uppercase tracking-[0.18em]',
                      location.pathname === item.slug
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    )}
                  >
                    {item.name === 'Home' ? <HomeIcon className="size-5" /> : <TrashIcon className="size-5" />}
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
                    placeholder="Search theories..."
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

                {userRole === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-control transition-colors text-sm font-bold uppercase tracking-[0.18em] text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  >
                    <TrashIcon className="size-5" />
                    Trash Bin
                  </Link>
                )}

                {authStatus && <LogoutBtn />}
                
                <Popover open={isMobileSettingsOpen} onOpenChange={setIsMobileSettingsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`${navControlClass} w-full justify-start rounded-control bg-transparent px-4 text-on-surface-variant hover:bg-surface-container hover:text-on-surface`}
                    >
                      <PaletteIcon className="mr-3 size-5" />
                      Theme Settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="center" sideOffset={8} className={settingsPanelClassName}>
                    <SettingsPanelContent {...settingsPanelProps} />
                  </PopoverContent>
                </Popover>
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

function PaletteIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  )
}

function QuillIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  )
}

function HomeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function TrashIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  )
}

export default Header