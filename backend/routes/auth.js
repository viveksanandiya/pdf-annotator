const {Router} = require('express');
const jwt = require('jsonwebtoken');
const {userModel} = require('../models/db');
const bcrypt = require('bcryptjs');

const authRoutes = Router();

// Signup
authRoutes.post('/signup', async(req,res) => {
  try {
    const {email, password} = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new userModel({
      email: email.toLowerCase(),
      password: hashedPassword 
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { 
        id: user._id, 
        email: user.email 
      },
      message: 'Account created successfully'
    });
  
  } catch(error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Server error during signup' 
    });
  }
});

// Login
authRoutes.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { 
        id: user._id, 
        email: user.email 
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
});

// Token verification endpoint (optional but useful)
authRoutes.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await userModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = authRoutes;