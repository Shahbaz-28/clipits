const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all available roles
router.get('/available', (req, res) => {
  res.json({
    roles: [
      { value: 'clipper', label: 'Clipper', description: 'Can create and submit content clips' },
      { value: 'creator', label: 'Creator', description: 'Can create campaigns and manage content' },
      { value: 'admin', label: 'Admin', description: 'Full system access and management' }
    ]
  });
});

// Get user's current role
router.get('/me', (req, res) => {
  res.json({
    role: req.user.role,
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    }
  });
});

// Update user role (admin only)
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['clipper', 'creator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be one of: clipper, creator, admin' });
    }

    // Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Role update error:', error);
      return res.status(500).json({ error: 'Failed to update user role' });
    }

    res.json({
      message: 'User role updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with their roles (admin only)
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Users fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users: data });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users by role
router.get('/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    const validRoles = ['clipper', 'creator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, status, created_at')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Users by role fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users: data });
  } catch (error) {
    console.error('Users by role fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
