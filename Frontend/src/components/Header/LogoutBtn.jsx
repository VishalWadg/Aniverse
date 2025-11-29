import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
    <button
      className='inline-block px-6 py-2 duration-200 hover:text-[#e5e6ff] hover:bg-[#030d34] rounded-full cursor-pointer'
      onClick={logoutHandler}
    >
      Logout
    </button>
  )
}

export default LogoutBtn