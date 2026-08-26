import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('luxury_admin_token') || localStorage.getItem('akiki_admin_token') || null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('luxury_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Verify on mount if token exists
  useEffect(() => {
    const verifySession = async () => {
      if (!adminToken) return;
      try {
        const res = await authAPI.verify();
        if (res.success && res.user) {
          setAdminUser(res.user);
        } else {
          logoutAdmin();
        }
      } catch (err) {
        // Session expired
        logoutAdmin();
      }
    };
    verifySession();
  }, [adminToken]);

  const loginAdmin = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login(credentials);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setAdminUser(res.user);
        localStorage.setItem('luxury_admin_token', res.token);
        localStorage.setItem('luxury_admin_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Authentication failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Master Admin credentials invalid' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('luxury_admin_token');
    localStorage.removeItem('luxury_admin_user');
    localStorage.removeItem('akiki_admin_token');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isAdminAuthenticated: !!adminToken,
        isLoading,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
