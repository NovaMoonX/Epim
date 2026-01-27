import { Outlet } from 'react-router-dom';
import { Header } from '@ui/Header';

function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-background transition-colors duration-200">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
