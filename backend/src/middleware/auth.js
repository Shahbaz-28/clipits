const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

// Initialize Supabase client if environment variables are available
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('⚠️  Supabase environment variables not found. Auth features will be disabled.');
}

const authMiddleware = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile from database to include role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Add user information to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || user.email?.split('@')[0],
      lastName: user.user_metadata?.last_name || '',
      imageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      role: profile?.role || 'clipper',
      ...profile
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user has admin role
const requireAdmin = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// Middleware to check if user has creator role
const requireCreator = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    if (!['creator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Creator access required' });
    }
    
    next();
  } catch (error) {
    console.error('Creator middleware error:', error);
    return res.status(403).json({ error: 'Creator access required' });
  }
};

// Middleware to check if user has clipper role
const requireClipper = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    if (!['clipper', 'creator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Clipper access required' });
    }
    
    next();
  } catch (error) {
    console.error('Clipper middleware error:', error);
    return res.status(403).json({ error: 'Clipper access required' });
  }
};

module.exports = {
  verifyToken: authMiddleware,
  requireAdmin,
  requireCreator,
  requireClipper,
  supabase
};
