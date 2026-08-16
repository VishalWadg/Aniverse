import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="fixed inset-y-0 left-0 right-auto top-0 z-50 h-full w-[72vw] max-w-[260px] sm:max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r border-outline-variant bg-surface-container px-5 py-5 shadow-elevation-2 flex flex-col justify-between overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300 will-change-transform">
        
        {/* Drawer Top Header & Navigation */}
        <div>
          {/* Navigation Links Section */}
          <div className="pt-4 space-y-2.5">
            {/* Home Link */}
            <Link
              to="/"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-sm font-semibold",
                location.pathname === '/' ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <HomeIcon className="size-5" /> Home
            </Link>

            {/* Profile Link */}
            {authStatus && currentUser && (
              <Link
                to={`/users/${currentUser.username}`}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-sm font-semibold",
                  location.pathname === `/users/${currentUser.username}` ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <UserIcon className="size-5" /> Profile
              </Link>
            )}

            {/* Admin Links */}
            {userRole === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-sm font-semibold text-error hover:bg-error/10",
                    location.pathname === '/admin' ? "bg-error/15 text-error" : ""
                  )}
                >
                  <TrashIcon className="size-5" /> Trash
                </Link>

                <Link
                  to="/admin/feedback"
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors text-sm font-semibold text-primary hover:bg-primary/10",
                    location.pathname === '/admin/feedback' ? "bg-primary/15 text-primary" : ""
                  )}
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Feedback
                </Link>
              </>
            )}
          </div>

          {/* Themes Accordion */}
          <div className="mt-1">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="theme" className="border-none">
                <AccordionTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2.5 rounded-control transition-colors text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:no-underline">
                  <div className="flex items-center gap-3">
                    <PaletteIcon className="size-5" /> Themes
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
              <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-control text-sm font-semibold">
                <Link to="/login" onClick={() => onOpenChange(false)}>
                  <LogInIcon className="size-5" /> Log In
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-3 rounded-control text-sm font-semibold">
                <Link to="/signup" onClick={() => onOpenChange(false)}>
                  <UserPlusIcon className="size-5" /> Sign Up
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
