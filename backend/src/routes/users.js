const express = require('express');
const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const userProfile = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      imageUrl: req.user.imageUrl,
      totalEarnings: 1250,
      totalViews: 2500000,
      joinedCampaigns: 8,
      completedSubmissions: 15,
      pendingSubmissions: 3,
      memberSince: "2024-01-01"
    };

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    // In a real app, you'd update this in a database
    const updatedProfile = {
      id: req.user.id,
      email: req.user.email,
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      imageUrl: req.user.imageUrl
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user earnings
router.get('/earnings', async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const earnings = {
      totalEarnings: 1250,
      thisMonth: 450,
      lastMonth: 800,
      pendingPayout: 200,
      earningsHistory: [
        { month: "Jan 2024", amount: 450 },
        { month: "Dec 2023", amount: 800 },
        { month: "Nov 2023", amount: 600 }
      ]
    };

    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    console.error('Get user earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// Get user analytics
router.get('/analytics', async (req, res) => {
  try {
    // In a real app, you'd fetch this from a database
    const analytics = {
      totalViews: 2500000,
      totalSubmissions: 18,
      approvedSubmissions: 15,
      pendingSubmissions: 3,
      averageViewsPerSubmission: 138888,
      topPerformingCampaign: "Summer Fashion Haul",
      viewsThisMonth: 500000,
      viewsLastMonth: 800000
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

