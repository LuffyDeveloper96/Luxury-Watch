import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'akiki_london_master_horology_secret_key_2026';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Master admin access only.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin' && decoded.role !== 'Grand Horologist / Master Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Master admin clearance required.'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
      error: err.message
    });
  }
};
