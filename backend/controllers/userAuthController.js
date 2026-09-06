import bcrypt from 'bcryptjs';
import { User, ActivityLog } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

/**
 * 1. Patron Registration (Direct Email + Password)
 * POST /api/auth/user/signup
 */
export const initiateUserSignup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (typeof email !== 'string' || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters in length.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail }).lean();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please proceed to Sign In.'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      password: passwordHash,
      name: typeof name === 'string' && name.trim() ? name.trim() : cleanEmail.split('@')[0],
      phone: typeof phone === 'string' ? phone.trim() : '',
      role: 'customer',
      verified: true,
      addresses: [],
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date()
    });

    try {
      await ActivityLog.create({
        id: `act-${Date.now()}`,
        text: `✨ New patron "${user.name}" created an account`,
        time: 'Just now',
        type: 'user'
      });
    } catch (logErr) {}

    const token = generateToken({
      id: user.id || user._id.toString(),
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    const sanitizedUser = user.toObject ? user.toObject() : { ...user };
    delete sanitizedUser.password;

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2. Patron Sign In (Direct Email + Password)
 * POST /api/auth/user/login
 */
export const initiateUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
    }

    // Update last login
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Generate JWT token
    const token = generateToken({
      id: user.id || user._id.toString(),
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    const sanitizedUser = user.toObject ? user.toObject() : { ...user };
    delete sanitizedUser.password;

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3. Get Authenticated Customer Profile
 * GET /api/auth/user/me
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email?.toLowerCase();

    const user = await User.findOne({
      $or: [
        { id: userId },
        { email: userEmail }
      ]
    }).lean();

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
 * 4. Add Shipping Address
 * POST /api/auth/user/addresses
 */
export const addAddress = async (req, res) => {
  try {
    const { fullName, phone, street, landmark, city, state, postalCode, country = 'India', isDefault = false } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory address fields.' });
    }

    const userId = req.user?.id;
    const userEmail = req.user?.email?.toLowerCase();

    const user = await User.findOne({
      $or: [{ id: userId }, { email: userEmail }]
    });

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

    user.addresses = addresses;
    user.updatedAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'Consignment address registered successfully.',
      address: newAddress,
      addresses: user.addresses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5. Delete Shipping Address
 * DELETE /api/auth/user/addresses/:id
 */
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email?.toLowerCase();

    const user = await User.findOne({
      $or: [{ id: userId }, { email: userEmail }]
    });

    if (!user) return res.status(404).json({ success: false, message: 'Patron not found.' });

    user.addresses = (user.addresses || []).filter(a => a.id !== id);
    user.updatedAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'Address removed.',
      addresses: user.addresses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 6. Set Default Address
 * PUT /api/auth/user/addresses/:id/default
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email?.toLowerCase();

    const user = await User.findOne({
      $or: [{ id: userId }, { email: userEmail }]
    });

    if (!user) return res.status(404).json({ success: false, message: 'Patron not found.' });

    user.addresses = (user.addresses || []).map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    user.updatedAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'Default address updated.',
      addresses: user.addresses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 7. Admin: List all registered customers (Paginated)
 * GET /api/admin/customers
 */
export const getAdminCustomers = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      User.countDocuments({}),
      User.find({}).select('-password').skip(skip).limit(limitNum).lean()
    ]);

    return res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      customers: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  initiateUserSignup,
  initiateUserLogin,
  getMe,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getAdminCustomers
};
