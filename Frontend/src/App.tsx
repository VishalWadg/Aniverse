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
    <div className="dark min-h-screen bg-[#191919] text-foreground">
      <div className="flex min-h-screen flex-col bg-[#191919]">
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
