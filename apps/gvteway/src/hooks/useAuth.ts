import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
    if (token) {
      setUser({ id: '1', email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, __password: string) => {
    document.cookie = 'auth-token=dummy-token; path=/';
    setUser({ id: '1', email });
  };

  const signOut = async () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
