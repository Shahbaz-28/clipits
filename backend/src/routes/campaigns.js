const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        created_by:users(first_name, last_name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch campaigns' });
    }

    // Transform data to match frontend expectations
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      earnings: `$${campaign.progress_paid_out.toLocaleString()}`,
      total: `$${campaign.total_budget.toLocaleString()}`,
      percentage: `${campaign.progress_percentage}%`,
      rate: `$${campaign.rate_per_1k} / 1K`,
      type: campaign.type,
      platforms: campaign.platforms || [],
      views: `${(campaign.views_count / 1000000).toFixed(1)}M`,
      color: "bg-vibrant-red-orange",
      progressPaidOut: campaign.progress_paid_out,
      totalBudgetDetail: campaign.total_budget,
      progressPercentage: campaign.progress_percentage,
      daysLeft: campaign.days_left,
      minPayout: campaign.min_payout,
      maxPayout: campaign.max_payout,
      category: campaign.category,
      requirements: campaign.requirements || [],
      assets: campaign.assets || [],
      disclaimer: "All submissions are subject to review and approval."
    }));

    res.json({
      success: true,
      data: transformedCampaigns,
      count: transformedCampaigns.length
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create new campaign (Admins only - creators submit requests instead)
router.post('/', async (req, res) => {
  try {
    // Check if user has permission to create campaigns
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create campaigns directly. Creators should submit requests.' });
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

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
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
        days_left: days_left ? parseInt(days_left) : null,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Campaign creation error:', error);
      return res.status(500).json({ error: 'Failed to create campaign' });
    }

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        created_by:users(first_name, last_name)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Transform data to match frontend expectations
    const transformedCampaign = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      earnings: `$${campaign.progress_paid_out.toLocaleString()}`,
      total: `$${campaign.total_budget.toLocaleString()}`,
      percentage: `${campaign.progress_percentage}%`,
      rate: `$${campaign.rate_per_1k} / 1K`,
      type: campaign.type,
      platforms: campaign.platforms || [],
      views: `${(campaign.views_count / 1000000).toFixed(1)}M`,
      color: "bg-vibrant-red-orange",
      progressPaidOut: campaign.progress_paid_out,
      totalBudgetDetail: campaign.total_budget,
      progressPercentage: campaign.progress_percentage,
      daysLeft: campaign.days_left,
      minPayout: campaign.min_payout,
      maxPayout: campaign.max_payout,
      category: campaign.category,
      requirements: campaign.requirements || [],
      assets: campaign.assets || [],
      disclaimer: "All submissions are subject to review and approval."
    };

    res.json({
      success: true,
      data: transformedCampaign
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Join a campaign
router.post('/:id/join', async (req, res) => {
  try {
    // First, get or create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
                      id: req.user.id,
            email: req.user.email,
          first_name: req.user.firstName,
          last_name: req.user.lastName,
          image_url: req.user.imageUrl
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Create user error:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
    }

    const userId = user?.id || newUser.id;

    // Check if user already joined this campaign
    const { data: existingJoin, error: checkError } = await supabase
      .from('user_campaigns')
      .select('id')
      .eq('user_id', userId)
      .eq('campaign_id', req.params.id)
      .single();

    if (existingJoin) {
      return res.status(400).json({ error: 'Already joined this campaign' });
    }

    // Join the campaign
    const { data: joinData, error: joinError } = await supabase
      .from('user_campaigns')
      .insert({
        user_id: userId,
        campaign_id: req.params.id
      })
      .select()
      .single();

    if (joinError) {
      console.error('Join campaign error:', joinError);
      return res.status(500).json({ error: 'Failed to join campaign' });
    }

    // Update user's joined campaigns count
    await supabase
      .from('users')
      .update({ 
        joined_campaigns_count: supabase.rpc('increment', { row_id: userId, column_name: 'joined_campaigns_count' })
      })
      .eq('id', userId);

    res.json({
      success: true,
      message: 'Successfully joined campaign',
      data: {
        campaignId: req.params.id,
        userId: userId,
        joinedAt: joinData.joined_at
      }
    });
  } catch (error) {
    console.error('Join campaign error:', error);
    res.status(500).json({ error: 'Failed to join campaign' });
  }
});

module.exports = router;
