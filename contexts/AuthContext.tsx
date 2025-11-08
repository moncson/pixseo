'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange } from '@/lib/firebase/auth';
import { UserRole } from '@/types/user';

interface AuthContextType {
  user: FirebaseUser | null;
  userRole: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('[AuthProvider] Initializing auth state...');
    
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('[AuthProvider] Auth state changed:', firebaseUser ? 'Logged in' : 'Not logged in');
      setUser(firebaseUser);
      
      // ユーザーのロール情報を取得（キャッシュを優先）
      if (firebaseUser) {
        // ローカルストレージからキャッシュを確認
        const cachedRole = typeof window !== 'undefined' 
          ? localStorage.getItem(`userRole_${firebaseUser.uid}`) 
          : null;
        
        if (cachedRole) {
          // キャッシュがあればそれを使用
          setUserRole(cachedRole as UserRole);
          console.log('[AuthProvider] Using cached role:', cachedRole);
        } else {
          // キャッシュがなければAPIから取得
          try {
            const response = await fetch(`/api/admin/users/${firebaseUser.uid}`);
            if (response.ok) {
              const userData = await response.json();
              const role = userData.role || 'admin';
              setUserRole(role);
              // ローカルストレージにキャッシュ
              if (typeof window !== 'undefined') {
                localStorage.setItem(`userRole_${firebaseUser.uid}`, role);
              }
              console.log('[AuthProvider] Fetched and cached role:', role);
            } else {
              setUserRole('admin');
              if (typeof window !== 'undefined') {
                localStorage.setItem(`userRole_${firebaseUser.uid}`, 'admin');
              }
            }
          } catch (error) {
            console.error('[AuthProvider] Error fetching user role:', error);
            setUserRole('admin');
          }
        }
      } else {
        setUserRole(null);
      }
      
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
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

