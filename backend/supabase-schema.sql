-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
-- Note: JWT secret is managed by Supabase automatically

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('clipper', 'creator', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image_url TEXT,
  role user_role DEFAULT 'clipper',
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  joined_campaigns_count INTEGER DEFAULT 0,
  completed_submissions_count INTEGER DEFAULT 0,
  pending_submissions_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rate_per_1k DECIMAL(5,2) NOT NULL,
  total_budget DECIMAL(10,2) NOT NULL,
  progress_paid_out DECIMAL(10,2) DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  min_payout DECIMAL(8,2),
  max_payout DECIMAL(8,2),
  category VARCHAR(100),
  type VARCHAR(50),
  platforms JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  assets JSONB DEFAULT '[]',
  days_left INTEGER,
  views_count BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Campaigns (Many-to-Many relationship)
CREATE TABLE user_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(user_id, campaign_id)
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  post_link TEXT NOT NULL,
  platform VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  earnings DECIMAL(8,2) DEFAULT 0,
  views BIGINT DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT
);

-- Payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_details JSONB DEFAULT '{}',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id)
);

-- Earnings History table
CREATE TABLE earnings_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  amount DECIMAL(8,2) NOT NULL,
  views_count BIGINT DEFAULT 0,
  rate_per_1k DECIMAL(5,2),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator Requests table (for campaign creation requests)
CREATE TABLE creator_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rate_per_1k DECIMAL(5,2) NOT NULL,
  total_budget DECIMAL(10,2) NOT NULL,
  min_payout DECIMAL(8,2),
  max_payout DECIMAL(8,2),
  category VARCHAR(100),
  type VARCHAR(50),
  platforms JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  assets JSONB DEFAULT '[]',
  days_left INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_campaign_id ON submissions(campaign_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_user_campaigns_user_id ON user_campaigns(user_id);
CREATE INDEX idx_user_campaigns_campaign_id ON user_campaigns(campaign_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_creator_requests_creator_id ON creator_requests(creator_id);
CREATE INDEX idx_creator_requests_status ON creator_requests(status);
CREATE INDEX idx_creator_requests_created_at ON creator_requests(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creator_requests_updated_at BEFORE UPDATE ON creator_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, image_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Campaigns are public for viewing
CREATE POLICY "Campaigns are viewable by all" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Only admins can create campaigns" ON campaigns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update campaigns" ON campaigns FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Submissions policies
CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Users can create own submissions" ON submissions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Users can update own submissions" ON submissions FOR UPDATE USING (
  user_id = auth.uid()
);
CREATE POLICY "Admins can view all submissions" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Payouts policies
CREATE POLICY "Users can view own payouts" ON payouts FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Users can create own payout requests" ON payouts FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Admins can view all payouts" ON payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update payouts" ON payouts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- User campaigns policies
CREATE POLICY "Users can view own campaign joins" ON user_campaigns FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Users can join campaigns" ON user_campaigns FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

-- Creator Requests policies
CREATE POLICY "Creators can view own requests" ON creator_requests FOR SELECT USING (
  creator_id = auth.uid()
);
CREATE POLICY "Creators can create own requests" ON creator_requests FOR INSERT WITH CHECK (
  creator_id = auth.uid()
);
CREATE POLICY "Admins can view all creator requests" ON creator_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update creator requests" ON creator_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-admin-user-id' with the actual UUID from Supabase Auth
INSERT INTO users (id, email, first_name, last_name, role) VALUES
('your-admin-user-id', 'admin@clipit.com', 'Admin', 'User', 'admin');

-- Insert sample campaigns (after admin user is created)
INSERT INTO campaigns (title, description, rate_per_1k, total_budget, min_payout, max_payout, category, type, platforms, requirements, days_left, created_by) VALUES
(
  'Summer Fashion Haul',
  'Create engaging content showcasing the latest summer fashion trends.',
  2.00,
  10000.00,
  50.00,
  2000.00,
  'E-commerce',
  'UGC',
  '["Instagram"]',
  '["Must be high-quality edits", "No reusing our previously edited content", "Must be clipped content not already edited videos", "Content must be lifestyle, ecom, motivational, or podcast-related", "Must have comments on", "Tag Ac Hampton profile (on that platform) + follow", "English only", "Direct to Ac''s Youtube"]',
  20,
  'your-admin-user-id'
),
(
  'Gaming Highlights Reel',
  'Showcase your best gaming moments and epic plays.',
  1.50,
  2000.00,
  30.00,
  1000.00,
  'Gaming',
  'Clipping',
  '["Instagram"]',
  '["Must be 1080p resolution", "Include game audio", "No copyrighted music", "Minimum 30 seconds duration"]',
  15,
  'your-admin-user-id'
);
