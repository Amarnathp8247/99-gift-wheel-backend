import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import adminModel from '../models/admin.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        message: 'Authorization token missing or invalid',
        messageCode: 'AUTH_401',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];

    // 2️⃣ Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3️⃣ Fetch user from DB
    const user = await adminModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
        messageCode: 'AUTH_404',
        data: null,
      });
    }

    // 4️⃣ Attach full user object to request
    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token',
      messageCode: 'AUTH_403',
      data: null,
    });
  }
};

export default authMiddleware;
