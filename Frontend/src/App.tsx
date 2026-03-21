import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useRevalidator } from 'react-router-dom';
import { Footer, Header } from './components';
import './App.css';

function App() {
  const revalidator = useRevalidator();
  const location = useLocation();
  const authStatus = useSelector((state: any) => state.auth.status);
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    if (authStatus === true) {
      revalidator.revalidate();
    }
  }, [authStatus, revalidator]);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(255,69,58,0.1),_transparent_30%),linear-gradient(180deg,_rgba(18,18,18,1)_0%,_rgba(10,10,10,1)_55%,_rgba(8,8,8,1)_100%)]">
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
