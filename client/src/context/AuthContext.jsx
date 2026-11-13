import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem('gowander_token')) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('gowander_token'))
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('gowander_token', data.token);
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('gowander_token', data.token);
        setUser(data.user);
        return data.user;
      },
      logout() {
        localStorage.removeItem('gowander_token');
        setUser(null);
      },
      setUser,
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
