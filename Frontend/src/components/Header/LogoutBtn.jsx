import React from 'react'
import authService from '../../Appwrite/Auth'
import { logout, clearPostsState} from '../../store/index'
import { useDispatch } from 'react-redux'

function LogoutBtn(ref) {
  const dispatch = useDispatch();
  const logoutHandler = () => {
    authService.logOut()
    .then(() => {
      dispatch(logout())
      dispatch(clearPostsState())
    })
    .catch((e) => {
      console.log("Error:: LogoutHandler :: LogoutBtn", e);
    });
  }
  return (
    <button
      className='inline-bock px-6 py-2 duration-200 hover:text-[#e5e6ff] hover:bg-[#030d34] rounded-full'
      onClick={logoutHandler}
    >
      Logout
    </button>
  )
}

export default LogoutBtn