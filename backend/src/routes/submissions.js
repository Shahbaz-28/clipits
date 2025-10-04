const express = require('express');
const router = express.Router();

// Mock data for submissions
const submissions = [
  {
    id: "sub_1",
    userId: "user_1",
    campaignId: "summer-fashion-haul",
    postLink: "https://instagram.com/p/example1",
    platform: "Instagram",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    reviewedAt: null,
    earnings: 0,
    views: 0
  },
  {
    id: "sub_2",
    userId: "user_2",
    campaignId: "gaming-highlights-reel",
    postLink: "https://instagram.com/p/example2",
    platform: "Instagram",
    status: "approved",
    submittedAt: "2024-01-14T15:45:00Z",
    reviewedAt: "2024-01-15T09:20:00Z",
    earnings: 150,
    views: 50000
  }
];

// Get user's submissions
router.get('/', async (req, res) => {
  try {
    const userSubmissions = submissions.filter(sub => sub.userId === req.user.id);
    
    res.json({
      success: true,
      data: userSubmissions,
      count: userSubmissions.length
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submission by ID
router.get('/:id', async (req, res) => {
  try {
    const submission = submissions.find(sub => sub.id === req.params.id && sub.userId === req.user.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Submit new content
router.post('/', async (req, res) => {
  try {
    const { campaignId, postLink, platform } = req.body;

    if (!campaignId || !postLink || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newSubmission = {
      id: `sub_${Date.now()}`,
      userId: req.user.id,
      campaignId,
      postLink,
      platform,
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      earnings: 0,
      views: 0
    };

    // In a real app, you'd save this to a database
    submissions.push(newSubmission);

    res.status(201).json({
      success: true,
      message: 'Content submitted successfully',
      data: newSubmission
    });
  } catch (error) {
    console.error('Submit content error:', error);
    res.status(500).json({ error: 'Failed to submit content' });
  }
});

// Update submission
router.put('/:id', async (req, res) => {
  try {
    const submission = submissions.find(sub => sub.id === req.params.id && sub.userId === req.user.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const { postLink, platform } = req.body;

    if (postLink) submission.postLink = postLink;
    if (platform) submission.platform = platform;

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

module.exports = router;

