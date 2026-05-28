import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, session, isLoading, isInitialized, initialize, signOut } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  return {
    user,
    session,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    signOut,
  };
}
