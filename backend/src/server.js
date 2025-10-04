const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { verifyToken, requireAdmin, requireCreator, requireClipper } = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ClipIt Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes with role-based access
app.use('/api/campaigns', verifyToken, require('./routes/campaigns'));
app.use('/api/submissions', verifyToken, requireClipper, require('./routes/submissions'));
app.use('/api/users', verifyToken, require('./routes/users'));
app.use('/api/roles', verifyToken, require('./routes/roles'));
app.use('/api/creator-requests', verifyToken, require('./routes/creator-requests'));
app.use('/api/admin', verifyToken, requireAdmin, require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 ClipIt Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
