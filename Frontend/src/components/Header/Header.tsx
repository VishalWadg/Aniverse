import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import Container from '../Container/Container'
import Logo from '../Logo'
import LogoutBtn from './LogoutBtn'
import UserAvatar from '../User/UserAvatar'
import { normalizeBrandHex, useTheme } from '../ThemeProvider'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import ThemeSettingsPopover from '@/components/Theme/ThemeSettingsPopover'
import SettingsPanelContent from '@/components/Theme/SettingsPanelContent'
import {
  HomeIcon,
  QuillIcon,
  SettingsGearIcon,
  SearchIcon,
  TrashIcon,
  PaletteIcon,
  UserPlusIcon,
  LogInIcon,
  UserIcon
} from '@/components/ui/Icons';

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








function Header() {
  const authStatus = useAppSelector((state) => state.auth.status)
  const currentUser = useAppSelector((state) => state.auth.userData)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  
  const [isAuthSettingsOpen, setIsAuthSettingsOpen] = useState(false)
  const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false)
  
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'
  const navControlClass = 'h-control-h'
  const userRole = useAppSelector((state) => state.auth.userData?.role);
  const TOP_THRESHOLD = 80;
  
  const { theme, setTheme, brandColor, setBrandColor, resetBrandColor } = useTheme();
  const [colorInput, setColorInput] = useState(brandColor);
  const [colorError, setColorError] = useState('');
  
  const { scrollY } = useScroll();
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerHiddenRef = React.useRef(false);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest < TOP_THRESHOLD) {
      if (headerHiddenRef.current) {
        headerHiddenRef.current = false;
        setHeaderHidden(false);
      }
      return;
    }
    if (latest > previous && latest > 120) {
      if (!headerHiddenRef.current) {
        headerHiddenRef.current = true;
        setHeaderHidden(true);
        setIsAuthSettingsOpen(false);
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
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = searchValue.trim()
    const params = new URLSearchParams(location.search)
    if (nextQuery) params.set('q', nextQuery)
      else params.delete('q')
    
    const pathname = location.pathname === '/' || location.pathname === '/all-posts'
    ? location.pathname : '/all-posts'
    
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
  
  const settingsPanelProps = { theme, setTheme, brandColor, setBrandColor, resetBrandColor, colorInput, setColorInput, colorError, setColorError, commitBrandColor }

  // --- Auth Route Header ---
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
              <Link to="/" className="inline-flex size-10 items-center justify-center rounded-control text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" aria-label="Home">
                <HomeIcon className="size-5" />
              </Link>
              <ThemeSettingsPopover
                open={isAuthSettingsOpen}
                onOpenChange={setIsAuthSettingsOpen}
                trigger={
                  <button type="button" className="inline-flex size-10 items-center justify-center text-on-surface hover:bg-surface-container transition-colors rounded-control cursor-pointer">
                    <PaletteIcon className={`size-5 transition-transform duration-300 ${isAuthSettingsOpen ? 'rotate-45' : ''}`} />
                  </button>
                }
                options="p-card overflow-hidden"
              >
                <SettingsPanelContent {...settingsPanelProps} />
              </ThemeSettingsPopover>
              <Button asChild className={`${navControlClass} rounded-control px-3 sm:px-5 text-xs sm:text-sm font-semibold`}>
                <Link to={location.pathname === '/login' ? '/signup' : '/login'} className="flex items-center gap-2">
                  {location.pathname === '/login' ? <><UserPlusIcon className="size-5" /> Sign Up</> : <><LogInIcon className="size-5" /> Log In</>}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </motion.header>
    )
  }

  // --- Main App Header ---
  return (
    <motion.header
      variants={headerVariants}
      animate={headerHidden ? "hidden" : "visible"}
      transition={{ type: "decay", duration: 0.3, ease: "easeInOut" }}
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container/90 backdrop-blur-xl">
      <Container className="py-4">

        {/* Desktop Container */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center justify-between gap-3 sm:gap-6 shrink-0 lg:w-auto w-full">
            <Link to="/" className="w-32 sm:w-40 shrink-0">
              <Logo width="100%" />
            </Link>

            {/* Mobile Top-Level Actions (Only shows on small screens) */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
              <Link to="/" className="inline-flex size-10 sm:size-10 items-center justify-center rounded-control text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface" aria-label="Home">
                <HomeIcon className="size-5 " />
              </Link>
              <Link to={authStatus ? '/add-post' : '/signup'} className="inline-flex size-10 items-center justify-center rounded-control bg-primary text-on-primary transition hover:opacity-90">
                <QuillIcon className="size-5" />
              </Link>
              {authStatus && currentUser && (
                <Link to={`/users/${currentUser.username}`}>
                  <UserAvatar
                    userName={currentUser.name || currentUser.username}
                    avatarSeed={currentUser.username}
                    profileUrl={currentUser.profilePic}
                    size="sm"
                    className="size-10 data-[size=sm]:size-10 border border-outline-variant"
                  />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="inline-flex size-10 items-center justify-center border border-outline-variant text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface rounded-control"
              >
                <SettingsGearIcon className={`size-5 transition-transform duration-300 ${isMobileNavOpen ? 'rotate-45' : ''}`} />
              </button>
            </div>
          </div>

          {/* Desktop Nav Items & Actions */}
          {/*logged in user desktop header  */}
          <div className="hidden lg:flex flex-1 items-center gap-6 justify-between ml-6">

            {/* 1. Search Bar - Pushed to the left */}
            <form onSubmit={handleSearch} className="flex flex-1 max-w-md items-center">
              <div className="relative w-full">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search theories..."
                  className={`${navControlClass} w-full rounded-control pr-4 pl-11 text-xs font-semibold`}
                />
              </div>
            </form>
            <div className="flex items-center gap-2">
              {/* 2. Primary Navigation */}
              <nav className="flex items-center gap-1">
                {navRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.slug}
                    title={item.name}
                    className={cn(
                      'inline-flex size-10 items-center justify-center rounded-control transition-colors',
                      location.pathname === item.slug ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    )}
                  >
                    {item.name === 'Home' ? <HomeIcon className="size-5" /> : <TrashIcon className="size-5" />}
                  </Link>
                ))}
              </nav>

              {/* 3. User Actions */}
              {!authStatus ? (

                <div className="flex items-center gap-2 pl-1">
                  <Link to="/add-post" className="inline-flex size-10 items-center justify-center rounded-control bg-primary text-on-primary transition hover:opacity-90" title="Write a theory">
                    <QuillIcon className="size-5" />
                  </Link>

                  <ThemeSettingsPopover
                    open={isDesktopSettingsOpen}
                    onOpenChange={setIsDesktopSettingsOpen}
                    trigger={
                      <button type="button" className="inline-flex size-10 items-center justify-center text-on-surface hover:bg-surface-container transition-colors rounded-control cursor-pointer">
                        <PaletteIcon className={`size-5 transition-transform duration-300 ${isDesktopSettingsOpen ? 'rotate-45' : ''}`} />
                      </button>
                    }
                    options="p-card overflow-hidden"
                  >
                    <SettingsPanelContent {...settingsPanelProps} />
                  </ThemeSettingsPopover>

                  <Button asChild variant="ghost" className="rounded-control text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                    <Link to="/login"><><LogInIcon className="size-5" /> Log In</></Link>
                  </Button>
                  <Button asChild className="rounded-control text-sm font-semibold">
                    <Link to="/signup"><><UserPlusIcon className="size-5" /> Sign Up</></Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <Link to="/add-post" className="inline-flex size-10 items-center justify-center rounded-control bg-primary text-on-primary transition hover:opacity-90" title="Write a theory">
                    <QuillIcon className="size-5" />
                  </Link>

                  {/* Strictly a Link now */}
                  <Link to={`/users/${currentUser.username}`} title="Profile" className="inline-flex items-center justify-center transition hover:opacity-80">
                    <UserAvatar
                      userName={currentUser.name || currentUser.username}
                      avatarSeed={currentUser.username}
                      profileUrl={currentUser.profilePic}
                      size="sm"
                      className="size-10 data-[size=sm]:size-10 border border-outline-variant"
                    />
                  </Link>

                  {/* New Settings Popover Trigger */}
                  <ThemeSettingsPopover
                    open={isDesktopSettingsOpen} 
                    onOpenChange={setIsDesktopSettingsOpen}
                    trigger={
                      <button type="button" className="inline-flex size-10 items-center justify-center rounded-control text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                        <SettingsGearIcon className={`size-5 transition-transform duration-300 ${isDesktopSettingsOpen ? 'rotate-45' : ''}`} />
                      </button>
                    }
                    sideOffset={12}
                    options="p-0 overflow-hidden"
                  >
                    <div className="flex flex-col">

                        {userRole === 'ADMIN' && (
                          <>
                            <div className="p-2">
                              <Link to="/admin" onClick={() => setIsDesktopSettingsOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-control transition-colors text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                                <TrashIcon className="size-5" /> Trash Bin
                              </Link>
                            </div>

                          </>
                        )}

                        <div className="p-2">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="theme" className="border-none">
                              <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-control transition-colors text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <PaletteIcon className="size-5" /> Theme Settings
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3 pt-2">
                                <SettingsPanelContent {...settingsPanelProps} />
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="p-2">
                          <LogoutBtn />
                        </div>
                      </div>
                  </ThemeSettingsPopover>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileNavOpen ? (
          <div className="absolute top-full left-0 w-full bg-surface-container backdrop-blur-xl border-b border-outline-variant px-4 pb-4 pt-2 lg:hidden shadow-elevation-2">



            <nav className="flex flex-col gap-2">
              {navRoutes.map((item) => (
                <Link
                  key={item.name}
                  to={item.slug}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-control transition-colors text-sm font-semibold',
                    location.pathname === item.slug ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  {item.name === 'Home' ? <HomeIcon className="size-5" /> : <TrashIcon className="size-5" />}
                  {item.name}
                </Link>
              ))}

              {/* Profile Link inside mobile menu */}
              {authStatus && currentUser && (
                <Link
                  to={`/users/${currentUser.username}`}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-control transition-colors text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                >
                  <UserIcon className="size-5" /> Profile
                </Link>
              )}
            </nav>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="theme" className="border-none">
                <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 rounded-control transition-colors text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:no-underline">
                  <div className="flex items-center gap-3">
                    <PaletteIcon className="size-5" /> Theme Settings
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-2">
                  <SettingsPanelContent {...settingsPanelProps} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-2 flex flex-col gap-2">
              {!authStatus ? (
                <>
                  <Button asChild variant="ghost" className="flex items-center gap-3 w-full justify-start rounded-control bg-transparent px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                    <Link to="/login" onClick={() => setIsMobileNavOpen(false)}>
                      <LogInIcon className="size-5" /> Log In
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="flex items-center gap-3 w-full justify-start rounded-control bg-transparent px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                    <Link to="/signup" onClick={() => setIsMobileNavOpen(false)}>
                      <UserPlusIcon className="size-5" /> Sign Up
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  {/* Theme Settings injected into Mobile Menu */}

                  <div className="mt-2">
                    <LogoutBtn />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Container>
    </motion.header>
  )
}


export default Header