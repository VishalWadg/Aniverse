import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import authApi from '../../api/authApi'
import useToasts from '../../hooks/useToasts'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '../../store/' // Import from authSlice only

function LogOutIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function LogoutBtn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toasts = useToasts();

  const logoutHandler = async () => {
    try {
      // 1. Server Logout (Clear Refresh Token Cookie)
      await toasts.promise(
        authApi.logout(),
        {
          loading: "Logging out...",
          success: "Logged out successfully!",
          error: "Failed to log out"
        }
      );
      
      // 2. Client Logout (Clear Auth State)
      dispatch(logout());
      
      // 3. Redirect to Login
      // This ensures the user leaves any protected pages
      navigate('/login');
      
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="flex items-center gap-2 w-full justify-start rounded-control bg-transparent px-3 py-2 text-sm font-semibold text-error hover:bg-error/10 transition-colors"
      onClick={logoutHandler}
    >
      <LogOutIcon className="size-4" />
      Log Out
    </Button>
  )
}

export default LogoutBtn
