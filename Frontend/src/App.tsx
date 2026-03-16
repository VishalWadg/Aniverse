import { useEffect, useState, useRef } from 'react';
import { useDispatch } from "react-redux";
import { login, logout } from './store'; // Update imports if needed
import authApi from './api/authApi';
import { setMemoryTokenNExpiry } from './api/axiosClient'; // Import the token setter
import { Header, Footer } from './components';
import { Outlet, useRevalidator } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';

function App() {
  // Start loading as TRUE. 
  // We don't want to show the "Login" button before we check if the user is already logged in.
  // const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const isMounted = useRef(false);
  const revalidator = useRevalidator();
  const authStatus = useSelector((state: any) => state.auth.status);

  useEffect(() => {
    // THE FIX:
    // When 'authStatus' changes from false -> true (which happens after rootLoader finishes),
    // we tell React Router: "Data might be stale. Run all loaders again!"
    if (authStatus === true) {
        revalidator.revalidate(); 
    }
  }, [authStatus]);
  

  // Show a spinner while checking auth status
  if (false) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#3C467B] text-white">
        {/* You can use your BounceLoader here */}
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-wrap justify-center items-center text-center bg-[#3C467B] text-[#96aaf2]">
      <div className="w-full block items-center justify-center">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
