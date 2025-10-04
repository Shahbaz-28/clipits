const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all creator requests (admin only)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('creator_requests')
      .select(`
        *,
        creator:users(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Creator requests fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch creator requests' });
    }

    res.json({ requests: data });
  } catch (error) {
    console.error('Creator requests fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get creator's own requests
router.get('/my-requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('creator_requests')
      .select('*')
      .eq('creator_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('My requests fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch your requests' });
    }

    res.json({ requests: data });
  } catch (error) {
    console.error('My requests fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new creator request
router.post('/', async (req, res) => {
  try {
    // Check if user has creator role
    if (!['creator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only creators can submit campaign requests' });
    }

    const {
      title,
      description,
      rate_per_1k,
      total_budget,
      min_payout,
      max_payout,
      category,
      type,
      platforms,
      requirements,
      assets,
      days_left
    } = req.body;

    // Validate required fields
    if (!title || !rate_per_1k || !total_budget) {
      return res.status(400).json({ error: 'Title, rate per 1K, and total budget are required' });
    }

    const { data: request, error } = await supabase
      .from('creator_requests')
      .insert({
        creator_id: req.user.id,
        title,
        description,
        rate_per_1k: parseFloat(rate_per_1k),
        total_budget: parseFloat(total_budget),
        min_payout: min_payout ? parseFloat(min_payout) : null,
        max_payout: max_payout ? parseFloat(max_payout) : null,
        category,
        type,
        platforms: platforms || [],
        requirements: requirements || [],
        assets: assets || [],
        days_left: days_left ? parseInt(days_left) : null
      })
      .select()
      .single();

    if (error) {
      console.error('Creator request creation error:', error);
      return res.status(500).json({ error: 'Failed to create request' });
    }

    res.status(201).json({
      success: true,
      message: 'Campaign request submitted successfully. Waiting for admin approval.',
      data: request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update creator request status (admin only)
router.put('/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, admin_notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, approved, rejected' });
    }

    // Update request status
    const { data: request, error } = await supabase
      .from('creator_requests')
      .update({
        status,
        admin_notes,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Request status update error:', error);
      return res.status(500).json({ error: 'Failed to update request status' });
    }

    // If approved, create a notification for the creator
    if (status === 'approved') {
      await supabase
        .from('notifications')
        .insert({
          user_id: request.creator_id,
          title: 'Campaign Request Approved',
          message: `Your campaign request "${request.title}" has been approved. You can now pay the money pool to activate it.`,
          type: 'success'
        });
    } else if (status === 'rejected') {
      await supabase
        .from('notifications')
        .insert({
          user_id: request.creator_id,
          title: 'Campaign Request Rejected',
          message: `Your campaign request "${request.title}" has been rejected. ${admin_notes || 'Please review and resubmit.'}`,
          type: 'error'
        });
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      data: request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get creator request by ID
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const { data: request, error } = await supabase
      .from('creator_requests')
      .select(`
        *,
        creator:users(first_name, last_name, email),
        reviewer:users!creator_requests_reviewed_by_fkey(first_name, last_name)
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Request fetch error:', error);
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user has permission to view this request
    if (request.creator_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Request fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
