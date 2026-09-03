import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAuthAPI } from '../services/api';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('luxury_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('luxury_user_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [userOrders, setUserOrders] = useState([]);
  const [userReturns, setUserReturns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync profile on token change
  const refreshUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await userAuthAPI.getMe(token);
      if (res.success && res.user) {
        setUser(res.user);
        setUserOrders(res.orders || []);
        setUserReturns(res.returns || []);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('[UserAuth] Session refresh error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshUserProfile();
    }
  }, [token, refreshUserProfile]);

  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  const openAuthModal = (tab = 'signin', onSuccess = null) => {
    setAuthModalTab(tab);
    if (typeof onSuccess === 'function') {
      setAuthSuccessCallback(() => onSuccess);
    } else {
      setAuthSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  // Sign Up Flow (Email + Password)
  const initiateSignup = async ({ name, email, password, phone }) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.initiateSignup({ name, email, password, phone });
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
        localStorage.setItem('luxury_user_token', res.token);
        setIsAuthModalOpen(false);

        if (typeof authSuccessCallback === 'function') {
          const cb = authSuccessCallback;
          setAuthSuccessCallback(null);
          setTimeout(() => cb(res.user), 150);
        }
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Unable to register.' };
    } finally {
      setLoading(false);
    }
  };

  const verifySignup = async ({ email, otp }) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.verifySignup({ email, otp });
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
        localStorage.setItem('luxury_user_token', res.token);
        setIsAuthModalOpen(false);

        if (typeof authSuccessCallback === 'function') {
          const cb = authSuccessCallback;
          setAuthSuccessCallback(null);
          setTimeout(() => cb(res.user), 150);
        }
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Verification failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Sign In Flow (Email + Password)
  const initiateLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.initiateLogin({ email, password });
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
        localStorage.setItem('luxury_user_token', res.token);
        setIsAuthModalOpen(false);

        if (typeof authSuccessCallback === 'function') {
          const cb = authSuccessCallback;
          setAuthSuccessCallback(null);
          setTimeout(() => cb(res.user), 150);
        }
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyLogin = async ({ email, otp }) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.verifyLogin({ email, otp });
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
        localStorage.setItem('luxury_user_token', res.token);
        closeAuthModal();
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || '2FA Verification failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Forgot / Reset Password Flow
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      return await userAuthAPI.forgotPassword(email);
    } catch (err) {
      return { success: false, message: err.message || 'Failed to dispatch reset code.' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.resetPassword({ email, otp, newPassword });
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
        localStorage.setItem('luxury_user_token', res.token);
        closeAuthModal();
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Password reset failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Legacy & direct OTP helpers
  const sendOtp = async (email, name, purpose = 'login') => {
    return await userAuthAPI.sendOtp(email, name, purpose);
  };

  const verifyOtp = async (email, otp, name, phone) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.verifyOtp(email, otp, name, phone);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
        localStorage.setItem('luxury_user_token', res.token);
        closeAuthModal();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('luxury_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.addAddress(addressData);
      if (res.success && res.addresses) {
        setUser(prev => ({ ...prev, addresses: res.addresses }));
        localStorage.setItem('luxury_user', JSON.stringify({ ...user, addresses: res.addresses }));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    setLoading(true);
    try {
      const res = await userAuthAPI.deleteAddress(addressId);
      if (res.success && res.addresses) {
        setUser(prev => ({ ...prev, addresses: res.addresses }));
        localStorage.setItem('luxury_user', JSON.stringify({ ...user, addresses: res.addresses }));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserOrders([]);
    setUserReturns([]);
    localStorage.removeItem('luxury_user');
    localStorage.removeItem('luxury_user_token');
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        userOrders,
        userReturns,
        loading,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        initiateSignup,
        verifySignup,
        initiateLogin,
        verifyLogin,
        forgotPassword,
        resetPassword,
        sendOtp,
        verifyOtp,
        updateProfile,
        addAddress,
        deleteAddress,
        logout,
        refreshUserProfile
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export default UserAuthContext;
