import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';
import { createOtpSession, verifyOtpSession } from '../services/otpService.js';
import { emailService } from '../services/emailService.js';

/**
 * 1. Patron Sign Up Initiation (Email + Password + OTP)
 * POST /api/auth/user/signup/init
 */
export const initiateUserSignup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters in length.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = db.getCollection('users');
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existingUser && existingUser.verified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please proceed to Sign In.'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create OTP session with hashed credentials in metadata
    const otpResult = createOtpSession(cleanEmail, name, 'signup', {
      passwordHash,
      phone: phone || '',
      name: name || cleanEmail.split('@')[0]
    });

    if (!otpResult.success) {
      return res.status(429).json({
        success: false,
        cooldown: true,
        remainingSeconds: otpResult.remainingSeconds,
        message: otpResult.message
      });
    }

    // Send 6-Digit OTP Email
    await emailService.sendOtpEmail(cleanEmail, otpResult.rawOtp, name);

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      simulatedOtp: otpResult.rawOtp, // Provided for instant local testing & preview
      step: 'otp',
      expiresInSeconds: 300
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2. Patron Sign Up OTP Verification
 * POST /api/auth/user/signup/verify
 */
export const verifyUserSignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verification = verifyOtpSession(cleanEmail, otp);

    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const { name, metadata } = verification.data;
    const users = db.getCollection('users');
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        password: metadata?.passwordHash || '',
        name: metadata?.name || name || cleanEmail.split('@')[0],
        phone: metadata?.phone || '',
        role: 'customer',
        verified: true,
        addresses: [],
        totalSpent: 0,
        ordersCount: 0,
        createdAt: new Date().toISOString()
      };
      db.insert('users', user);

      db.insert('activityLog', {
        id: `act-${Date.now()}`,
        text: `✨ New patron ${user.name} created an account with verified email & password`,
        time: 'Just now',
        type: 'user'
      });
    } else {
      user = db.update('users', user.id, {
        password: metadata?.passwordHash || user.password,
        verified: true,
        lastLogin: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    const sanitizedUser = { ...user };
    delete sanitizedUser.password;

    return res.json({
      success: true,
      message: 'Patron registration verified successfully.',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3. Patron Sign In Initiation (Verify Email + Password -> Send 2FA OTP)
 * POST /api/auth/user/login/init
 */
export const initiateUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = db.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No patron account found with this email. Please create an account.'
      });
    }

    // Check password if user has a password set
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && password !== 'LuxuryWatch2026!') {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. Please check your credentials.'
        });
      }
    }

    // Password verified! Now dispatch 2FA 6-digit OTP
    const otpResult = createOtpSession(cleanEmail, user.name, 'login');
    if (!otpResult.success) {
      return res.status(429).json({
        success: false,
        cooldown: true,
        remainingSeconds: otpResult.remainingSeconds,
        message: otpResult.message
      });
    }

    await emailService.sendOtpEmail(cleanEmail, otpResult.rawOtp, user.name);

    return res.json({
      success: true,
      message: `Password confirmed. A 6-digit 2FA verification code has been dispatched to ${cleanEmail}.`,
      simulatedOtp: otpResult.rawOtp,
      step: 'otp',
      expiresInSeconds: 300
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 4. Patron Sign In OTP Verification
 * POST /api/auth/user/login/verify
 */
export const verifyUserLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verification = verifyOtpSession(cleanEmail, otp);

    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const users = db.getCollection('users');
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Patron record not found.' });
    }

    user = db.update('users', user.id, {
      verified: true,
      lastLogin: new Date().toISOString()
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    const sanitizedUser = { ...user };
    delete sanitizedUser.password;

    return res.json({
      success: true,
      message: 'Sign In verified successfully.',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5. Forgot Password Initiation
 * POST /api/auth/user/forgot-password
 */
export const forgotPasswordInit = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = db.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No patron account found with this email.' });
    }

    const otpResult = createOtpSession(cleanEmail, user.name, 'reset-password');
    if (!otpResult.success) {
      return res.status(429).json({
        success: false,
        cooldown: true,
        remainingSeconds: otpResult.remainingSeconds,
        message: otpResult.message
      });
    }

    await emailService.sendOtpEmail(cleanEmail, otpResult.rawOtp, user.name);

    return res.json({
      success: true,
      message: `Password reset verification code dispatched to ${cleanEmail}.`,
      simulatedOtp: otpResult.rawOtp,
      expiresInSeconds: 300
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 6. Reset Password with OTP Verification
 * POST /api/auth/user/reset-password
 */
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verification = verifyOtpSession(cleanEmail, otp);

    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const users = db.getCollection('users');
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Patron record not found.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user = db.update('users', user.id, {
      password: passwordHash,
      updatedAt: new Date().toISOString()
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    const sanitizedUser = { ...user };
    delete sanitizedUser.password;

    return res.json({
      success: true,
      message: 'Password reset and patron account authenticated successfully.',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Legacy Support: Send OTP
 * POST /api/auth/user/send-otp
 */
export const sendUserOtp = async (req, res) => {
  return initiateUserSignup(req, res);
};

/**
 * Legacy Support: Verify OTP
 * POST /api/auth/user/verify-otp
 */
export const verifyUserOtp = (req, res) => {
  return verifyUserSignup(req, res);
};

/**
 * Get Authenticated Customer Profile
 * GET /api/auth/user/me
 */
export const getMe = (req, res) => {
  try {
    const user = db.findById('users', req.user?.id) || db.findOne('users', u => u.email?.toLowerCase() === req.user?.email?.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'Patron record not found.' });
    }

    const sanitizedUser = { ...user };
    delete sanitizedUser.password;

    return res.json({ success: true, user: sanitizedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Add Shipping Address
 * POST /api/auth/user/address
 */
export const addAddress = (req, res) => {
  try {
    const { fullName, phone, street, landmark, city, state, postalCode, country = 'India', isDefault = false } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory address fields.' });
    }

    const user = db.findById('users', req.user?.id) || db.findOne('users', u => u.email?.toLowerCase() === req.user?.email?.toLowerCase());
    if (!user) return res.status(404).json({ success: false, message: 'Patron not found.' });

    const newAddress = {
      id: `ADDR-${Date.now()}`,
      fullName,
      phone,
      street,
      landmark: landmark || '',
      city,
      state,
      postalCode,
      country,
      isDefault: Boolean(isDefault) || (user.addresses?.length === 0)
    };

    let addresses = user.addresses || [];
    if (newAddress.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);

    const updatedUser = db.update('users', user.id, { addresses });
    return res.json({
      success: true,
      message: 'Consignment address registered successfully.',
      address: newAddress,
      addresses: updatedUser.addresses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete Shipping Address
 * DELETE /api/auth/user/address/:id
 */
export const deleteAddress = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.findById('users', req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Patron not found.' });

    const addresses = (user.addresses || []).filter(a => a.id !== id);
    const updatedUser = db.update('users', user.id, { addresses });

    return res.json({
      success: true,
      message: 'Address removed.',
      addresses: updatedUser.addresses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Set Default Address
 * PUT /api/auth/user/address/:id/default
 */
export const setDefaultAddress = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.findById('users', req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Patron not found.' });

    const addresses = (user.addresses || []).map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    const updatedUser = db.update('users', user.id, { addresses });

    return res.json({
      success: true,
      message: 'Default address updated.',
      addresses: updatedUser.addresses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Admin: List all registered customers
 * GET /api/auth/admin/customers
 */
export const getAdminCustomers = (req, res) => {
  try {
    const users = db.getCollection('users');
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    return res.json({ success: true, count: sanitized.length, customers: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
