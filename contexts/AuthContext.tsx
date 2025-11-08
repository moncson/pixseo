'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('[AuthProvider] Initializing auth state...');
    
    const unsubscribe = onAuthStateChange((user) => {
      console.log('[AuthProvider] Auth state changed:', user ? 'Logged in' : 'Not logged in');
      setUser(user);
      
      // 初回ロード完了後は常に loading = false に保つ
      if (!initialized) {
        setInitialized(true);
        setLoading(false);
        console.log('[AuthProvider] Initial auth check complete');
      }
    });

    return () => unsubscribe();
  }, [initialized]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

