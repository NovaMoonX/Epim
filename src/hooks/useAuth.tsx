import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@lib/firebase';
import { User, UserRole } from '@lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTester: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        // Get or create user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        } else {
          // Create new user document
          const role: UserRole =
            firebaseUser.email === 'nova@moondreams.dev'
              ? 'admin'
              : 'customer';

          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || firebaseUser.email!,
            photoURL: firebaseUser.photoURL || undefined,
            role,
            createdAt: Timestamp.now(),
          };

          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin';
  const isTester = user?.role === 'tester' || user?.role === 'admin';

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
    isAdmin,
    isTester,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
