import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useAuth } from '@hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '@ui/ThemeToggle';
import { APP_TITLE } from '@lib/app';

export function Header() {
  const { user, signIn, signOut, isAdmin, isTester } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            {APP_TITLE}
          </Link>
          
          {user && (
            <nav className="hidden md:flex gap-4">
              <Link
                to="/support"
                className={join(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/support') ? 'text-primary' : 'text-foreground/60'
                )}
              >
                My Support
              </Link>
              
              {isTester && (
                <Link
                  to="/testing"
                  className={join(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/testing') ? 'text-primary' : 'text-foreground/60'
                  )}
                >
                  Testing Portal
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className={join(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/admin') ? 'text-primary' : 'text-foreground/60'
                  )}
                >
                  Admin Dashboard
                </Link>
              )}
              
              <Link
                to="/knowledge-base"
                className={join(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/knowledge-base') ? 'text-primary' : 'text-foreground/60'
                )}
              >
                Knowledge Base
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-foreground/70">
                {user.displayName}
              </span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={signIn} size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
