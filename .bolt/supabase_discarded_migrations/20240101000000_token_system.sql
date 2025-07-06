-- Token System Database Migration
-- This migration adds the token economy for real-life rewards

-- Add token balance to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 0;

-- Create tokens_earned table for tracking token earnings
CREATE TABLE IF NOT EXISTS tokens_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL, -- 'level_up', 'badge_earned', 'exam_score', 'daily_bonus'
  source_id VARCHAR(255), -- badge_id or exam_id or level_number
  tokens_earned INTEGER NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create rewards catalog
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  token_cost INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'digital', 'physical', 'experience'
  subcategory VARCHAR(100), -- 'books', 'toys', 'certificates', 'outings'
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT -1, -- -1 means unlimited
  age_min INTEGER DEFAULT 3,
  age_max INTEGER DEFAULT 18,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reward claims table
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  tokens_spent INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'fulfilled', 'rejected'
  claimed_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id), -- parent approval
  approved_at TIMESTAMP,
  fulfilled_at TIMESTAMP,
  rejected_at TIMESTAMP,
  notes TEXT,
  fulfillment_details JSONB, -- shipping info, pickup details, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tokens_earned_student_id ON tokens_earned(student_id);
CREATE INDEX IF NOT EXISTS idx_tokens_earned_source_type ON tokens_earned(source_type);
CREATE INDEX IF NOT EXISTS idx_tokens_earned_earned_at ON tokens_earned(earned_at);

CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards(category);
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_rewards_token_cost ON rewards(token_cost);

CREATE INDEX IF NOT EXISTS idx_reward_claims_student_id ON reward_claims(student_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_status ON reward_claims(status);
CREATE INDEX IF NOT EXISTS idx_reward_claims_claimed_at ON reward_claims(claimed_at);

-- Create RLS policies for security
ALTER TABLE tokens_earned ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Tokens earned policies
CREATE POLICY "Users can view their students' token earnings" ON tokens_earned
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert token earnings" ON tokens_earned
  FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

-- Rewards policies
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rewards" ON rewards
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Reward claims policies
CREATE POLICY "Users can view their students' reward claims" ON reward_claims
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reward claims for their students" ON reward_claims
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their students' reward claims" ON reward_claims
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Insert sample rewards to get started
INSERT INTO rewards (name, description, token_cost, category, subcategory, image_url) VALUES
  -- Digital Rewards
  ('Gold Star Certificate', 'Downloadable achievement certificate with gold star design', 10, 'digital', 'certificates', '/images/rewards/gold-certificate.png'),
  ('Rainbow Badge', 'Special rainbow badge for your profile', 15, 'digital', 'badges', '/images/rewards/rainbow-badge.png'),
  ('Premium Avatar', 'Unlock premium avatar designs', 25, 'digital', 'avatars', '/images/rewards/premium-avatar.png'),
  
  -- Physical Rewards
  ('Stationery Set', 'Colorful pens, pencils, and notebook set', 50, 'physical', 'stationery', '/images/rewards/stationery-set.png'),
  ('Educational Book', 'Age-appropriate educational book', 75, 'physical', 'books', '/images/rewards/book.png'),
  ('Puzzle Game', 'Brain-training puzzle game', 100, 'physical', 'toys', '/images/rewards/puzzle.png'),
  ('Art Supply Kit', 'Complete art supplies for creative projects', 150, 'physical', 'creative', '/images/rewards/art-kit.png'),
  
  -- Experience Rewards
  ('Movie Tickets', 'Family movie theater tickets', 200, 'experience', 'entertainment', '/images/rewards/movie-tickets.png'),
  ('Ice Cream Treat', 'Special ice cream outing', 80, 'experience', 'food', '/images/rewards/ice-cream.png'),
  ('Science Museum Pass', 'Educational museum visit', 250, 'experience', 'educational', '/images/rewards/museum.png'),
  ('Zoo/Aquarium Visit', 'Family day at zoo or aquarium', 300, 'experience', 'outings', '/images/rewards/zoo.png')
ON CONFLICT DO NOTHING;

-- Function to update token balance
CREATE OR REPLACE FUNCTION update_token_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add tokens when earned
    UPDATE students 
    SET token_balance = COALESCE(token_balance, 0) + NEW.tokens_earned
    WHERE id = NEW.student_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'reward_claims' THEN
    -- Subtract tokens when claimed
    UPDATE students 
    SET token_balance = GREATEST(COALESCE(token_balance, 0) - NEW.tokens_spent, 0)
    WHERE id = NEW.student_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_token_balance_on_earn
  AFTER INSERT ON tokens_earned
  FOR EACH ROW
  EXECUTE FUNCTION update_token_balance();

CREATE TRIGGER update_token_balance_on_claim
  AFTER INSERT ON reward_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_token_balance();

-- Function to calculate total tokens earned
CREATE OR REPLACE FUNCTION get_total_tokens_earned(student_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(tokens_earned) FROM tokens_earned WHERE student_id = student_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total tokens spent
CREATE OR REPLACE FUNCTION get_total_tokens_spent(student_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(tokens_spent) FROM reward_claims WHERE student_id = student_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE tokens_earned IS 'Tracks all token earnings for students';
COMMENT ON TABLE rewards IS 'Catalog of available rewards that can be claimed with tokens';
COMMENT ON TABLE reward_claims IS 'Records of reward claims by students';
COMMENT ON COLUMN students.token_balance IS 'Current token balance for the student';
COMMENT ON COLUMN tokens_earned.source_type IS 'Type of achievement that earned tokens: level_up, badge_earned, exam_score, daily_bonus';
COMMENT ON COLUMN rewards.category IS 'Reward category: digital, physical, experience';
COMMENT ON COLUMN reward_claims.status IS 'Claim status: pending, approved, fulfilled, rejected';