import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import authApi from '../../api/authApi'
import useToasts from '../../hooks/useToasts'
import { logout } from '../../store/' // Import from authSlice only

function LogoutBtn() {
  const dispatch = useDispatch();
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
      className="rounded-none border border-white/10 bg-transparent px-4 text-[#d6d6d6] hover:bg-white/[0.04] hover:text-white"
      onClick={logoutHandler}
    >
      Logout
    </Button>
  )
}

export default LogoutBtn
