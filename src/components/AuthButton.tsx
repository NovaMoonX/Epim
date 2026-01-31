import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@lib/firebase';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';

export function AuthButton() {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast({ title: 'Logged in successfully', type: 'success' });
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch {
      addToast({ title: 'Login failed. Please check your credentials.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      addToast({ title: 'Logged out successfully', type: 'success' });
    } catch {
      addToast({ title: 'Logout failed', type: 'error' });
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/70">
          {user.email} {isAdmin && <span className="text-primary font-semibold">(Admin)</span>}
        </span>
        <Button onClick={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    );
  }

  if (showLogin) {
    return (
      <form onSubmit={handleLogin} className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-48"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-32"
        />
        <Button type="submit" size="sm" loading={loading}>
          Login
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowLogin(false)}>
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <Button onClick={() => setShowLogin(true)} variant="outline" size="sm">
      Admin Login
    </Button>
  );
}
