import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('heew_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('heew_user', JSON.stringify(user));
    else localStorage.removeItem('heew_user');
  }, [user]);

  const login = (token, role, extra = {}) => {
    localStorage.setItem('heew_token', token);
    setUser({ role, ...extra });
  };

  const logout = () => {
    localStorage.removeItem('heew_token');
    localStorage.removeItem('heew_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin', isEmployee: user?.role === 'employee' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
