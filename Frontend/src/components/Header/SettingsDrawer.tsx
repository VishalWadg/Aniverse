import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import SettingsPanelContent from '@/components/Theme/SettingsPanelContent'
import LogoutBtn from './LogoutBtn'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  UserIcon,
  TrashIcon,
  PaletteIcon,
  LogInIcon,
  UserPlusIcon,
} from '@/components/ui/Icons'

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  authStatus: boolean
  currentUser: { username: string; name?: string; profilePic?: string } | null
  userRole?: string
  settingsPanelProps: any
}

export default function SettingsDrawer({
  open,
  onOpenChange,
  authStatus,
  currentUser,
  userRole,
  settingsPanelProps,
}: SettingsDrawerProps) {
  const location = useLocation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-y-0 left-0 right-auto top-0 z-50 h-full w-[85vw] max-w-xs sm:max-w-sm translate-x-0 translate-y-0 rounded-none border-r border-outline-variant bg-surface-container p-5 shadow-elevation-2 flex flex-col justify-between overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300">
        
        {/* Drawer Top Header */}
        <div>
          <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4 mb-4">
            <DialogHeader>
              <DialogTitle className="text-base font-black uppercase tracking-wider text-on-surface">
                Menu & Settings
              </DialogTitle>
            </DialogHeader>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-8 items-center justify-center rounded-control text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links Section */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/60">
              Navigation
            </div>
            
            {/* Home Link */}
            <Link
              to="/"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-xs font-semibold",
                location.pathname === '/' ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <HomeIcon className="size-4" /> Home
            </Link>

            {/* Profile Link (When Logged In) */}
            {authStatus && currentUser && (
              <Link
                to={`/users/${currentUser.username}`}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-xs font-semibold",
                  location.pathname === `/users/${currentUser.username}` ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <UserIcon className="size-4" /> My Profile
              </Link>
            )}

            {/* Admin Trash Bin Link (Visible to Admin on All Viewports) */}
            {userRole === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-xs font-semibold text-error hover:bg-error/10",
                  location.pathname === '/admin' ? "bg-error/15 text-error" : ""
                )}
              >
                <TrashIcon className="size-4" /> Trash Bin (Admin)
              </Link>
            )}
          </div>

          {/* Appearance Section */}
          <div className="mt-6 border-t border-outline-variant/60 pt-4">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/60 mb-1">
              Preferences
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="theme" className="border-none">
                <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2.5 rounded-control transition-colors text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:no-underline">
                  <div className="flex items-center gap-3">
                    <PaletteIcon className="size-4" /> Theme Customizer
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-3 pt-2">
                  <SettingsPanelContent {...settingsPanelProps} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Drawer Bottom Auth Actions */}
        <div className="border-t border-outline-variant/60 pt-4 mt-6">
          {!authStatus ? (
            <div className="flex flex-col gap-2">
              <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-control text-xs font-semibold">
                <Link to="/login" onClick={() => onOpenChange(false)}>
                  <LogInIcon className="size-4" /> Log In
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-3 rounded-control text-xs font-semibold">
                <Link to="/signup" onClick={() => onOpenChange(false)}>
                  <UserPlusIcon className="size-4" /> Sign Up
                </Link>
              </Button>
            </div>
          ) : (
            <div onClick={() => onOpenChange(false)}>
              <LogoutBtn />
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}
