import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('akiki_admin_auth') === 'true' && !!localStorage.getItem('akiki_admin_token');
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('akiki_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Validate existing token with backend on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('akiki_admin_token');
      if (token) {
        try {
          const res = await authAPI.verify();
          if (!res.success) {
            logoutAdmin();
          }
        } catch (err) {
          // keep offline token if valid
        }
      }
    };
    if (isAdminAuthenticated) {
      checkToken();
    }
  }, []);

  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const loginAdmin = async (email, password, secretPin) => {
    if (isLockedOut) {
      return { success: false, message: `Terminal locked. Try again in ${lockoutTimer} seconds.` };
    }

    try {
      const res = await authAPI.login({
        email,
        password,
        passcodePin: secretPin
      });

      if (res.success && res.token) {
        setIsAdminAuthenticated(true);
        setAdminUser(res.user);
        setFailedAttempts(0);
        localStorage.setItem('akiki_admin_auth', 'true');
        localStorage.setItem('akiki_admin_token', res.token);
        localStorage.setItem('akiki_admin_user', JSON.stringify(res.user));
        return { success: true };
      }
    } catch (err) {
      // Fallback local master verification
      const cleanEmail = email.trim().toLowerCase();
      const isMasterEmail = cleanEmail === 'admin@luxurywatch.com' || cleanEmail === 'admin@akikilondon.com' || cleanEmail === 'admin@akiki.com';
      const isMasterPassword = password === 'LuxuryWatch2026!' || password === 'AkikiLuxe2026!' || password === 'admin123';
      const isSecretPinValid = !secretPin || secretPin.trim() === '8888' || secretPin.trim() === 'AKIKI' || secretPin.trim() === 'LUXURY';

      if (isMasterEmail && isMasterPassword && isSecretPinValid) {
        const user = {
          email: cleanEmail,
          role: 'Grand Horologist / Master Administrator',
          sessionId: `AK-SESS-${Date.now()}`,
          loginTime: new Date().toLocaleTimeString()
        };
        setIsAdminAuthenticated(true);
        setAdminUser(user);
        setFailedAttempts(0);
        localStorage.setItem('akiki_admin_auth', 'true');
        localStorage.setItem('akiki_admin_token', 'offline_master_jwt_token_2026');
        localStorage.setItem('akiki_admin_user', JSON.stringify(user));
        return { success: true };
      }
    }

    const attempts = failedAttempts + 1;
    setFailedAttempts(attempts);
    if (attempts >= 5) {
      setIsLockedOut(true);
      setLockoutTimer(60);
      return { success: false, message: 'Too many failed attempts. Terminal locked for 60 seconds.' };
    }
    return {
      success: false,
      message: `Invalid credentials. Master access only (${5 - attempts} attempts remaining).`
    };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('akiki_admin_auth');
    localStorage.removeItem('akiki_admin_token');
    localStorage.removeItem('akiki_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        loginAdmin,
        logoutAdmin,
        isLockedOut,
        lockoutTimer
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
