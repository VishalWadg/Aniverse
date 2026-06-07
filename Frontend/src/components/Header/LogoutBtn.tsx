import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import authApi from '../../api/authApi'
import useToasts from '../../hooks/useToasts'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '../../store/' // Import from authSlice only

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
      variant="outline"
      className="border-outline-variant bg-transparent px-4 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      onClick={logoutHandler}
    >
      Logout
    </Button>
  )
}

export default LogoutBtn
