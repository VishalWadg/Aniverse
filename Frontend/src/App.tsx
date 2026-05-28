import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer, Header, RouteToast } from './components';
import { subscribeAuthFailure } from './lib/authSession';
import { useAppDispatch } from './store/hooks';
import { logout } from './store';
import './index.css';

function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = subscribeAuthFailure(() => {
      dispatch(logout());
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <div className="flex min-h-screen flex-col bg-background">
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
