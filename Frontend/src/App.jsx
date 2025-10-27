import { useEffect, useState } from 'react';
import {useDispatch} from "react-redux";
import authService from './Appwrite/Auth';
import { login, logout } from './store';
import './App.css'
import { Header, Footer } from './components';
// import { BounceLoader } from "react-spinners";
import { useNavigate, Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])
  return (
    <div className="min-h-screen flex flex-wrap justify-center items-center text-center bg-[#3C467B] text-[#96aaf2]">
      <div className="w-full block items-center justify-center">
        <Header/>
            <Outlet/>
        <Footer/>
      </div>
    </div>
  )
}

export default App
