import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer, Header, RouteToast } from './components';
import { subscribeAuthFailure } from './lib/authSession';
import { logout } from './store';
import './App.css';

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = subscribeAuthFailure(() => {
      dispatch(logout());
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <div className="dark min-h-screen bg-[#191919] text-foreground">
      <div className="flex min-h-screen flex-col bg-[#191919]">
        <RouteToast />
        <Header />
        <main className={isAuthRoute ? 'flex-1' : 'min-h-[calc(100vh-9rem)]'}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
