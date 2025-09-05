const jwt = require('jsonwebtoken');
const {userModel} = require('../models/db');

const auth = async(req, res, next) => {
  try {
    // Accept token directly from Authorization header (no Bearer prefix needed)
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
  } catch(error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication' 
    });
  }
};
    
module.exports = auth;