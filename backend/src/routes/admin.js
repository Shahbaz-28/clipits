const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get admin dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      totalUsers: 1234,
      totalCampaigns: 567,
      totalSubmissions: 8901,
      totalPayouts: 125000,
      activeCampaigns: 45,
      pendingSubmissions: 234,
      thisMonthUsers: 123,
      thisMonthEarnings: 15000
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get admin metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const users = [
      {
        id: "user_1",
        email: "user1@example.com",
        firstName: "John",
        lastName: "Doe",
        totalEarnings: 1250,
        totalSubmissions: 15,
        status: "active",
        joinedAt: "2024-01-01"
      },
      {
        id: "user_2",
        email: "user2@example.com",
        firstName: "Jane",
        lastName: "Smith",
        totalEarnings: 800,
        totalSubmissions: 8,
        status: "active",
        joinedAt: "2024-01-15"
      }
    ];

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all submissions (admin only)
router.get('/submissions', async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const submissions = [
      {
        id: "sub_1",
        userId: "user_1",
        userEmail: "user1@example.com",
        campaignId: "summer-fashion-haul",
        campaignTitle: "Summer Fashion Haul",
        postLink: "https://instagram.com/p/example1",
        platform: "Instagram",
        status: "pending",
        submittedAt: "2024-01-15T10:30:00Z",
        earnings: 0,
        views: 0
      },
      {
        id: "sub_2",
        userId: "user_2",
        userEmail: "user2@example.com",
        campaignId: "gaming-highlights-reel",
        campaignTitle: "Gaming Highlights Reel",
        postLink: "https://instagram.com/p/example2",
        platform: "Instagram",
        status: "approved",
        submittedAt: "2024-01-14T15:45:00Z",
        earnings: 150,
        views: 50000
      }
    ];

    res.json({
      success: true,
      data: submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Approve/reject submission
router.put('/submissions/:id/status', async (req, res) => {
  try {
    const { status, earnings, views } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // In a real app, you'd update this in a database
    const updatedSubmission = {
      id: req.params.id,
      status,
      earnings: earnings || 0,
      views: views || 0,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.id
    };

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      data: updatedSubmission
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ error: 'Failed to update submission status' });
  }
});

// Get payout requests
router.get('/payouts', async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const payouts = [
      {
        id: "payout_1",
        userId: "user_1",
        userEmail: "user1@example.com",
        amount: 500,
        status: "pending",
        requestedAt: "2024-01-15T10:30:00Z",
        processedAt: null
      },
      {
        id: "payout_2",
        userId: "user_2",
        userEmail: "user2@example.com",
        amount: 300,
        status: "processed",
        requestedAt: "2024-01-14T15:45:00Z",
        processedAt: "2024-01-15T09:20:00Z"
      }
    ];

    res.json({
      success: true,
      data: payouts,
      count: payouts.length
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Process payout
router.put('/payouts/:id/process', async (req, res) => {
  try {
    // In a real app, you'd update this in a database and integrate with payment processor
    const processedPayout = {
      id: req.params.id,
      status: "processed",
      processedAt: new Date().toISOString(),
      processedBy: req.user.id
    };

    res.json({
      success: true,
      message: 'Payout processed successfully',
      data: processedPayout
    });
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

module.exports = router;
