-- Sample Badges for Testing the Badge System
-- Run this script to insert starter badges for testing badge functionality

-- Clear existing sample badges (optional)
-- DELETE FROM badges WHERE name IN ('First Steps', 'Quick Learner', 'Perfect Score', 'Learning Streak', 'Math Master', 'XP Collector');

-- Insert starter badges for comprehensive testing
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
-- First Achievement Badges
('First Steps', 'Complete your first exam', '🎯', 'first_exam', 1),
('Beginner', 'Complete 3 exams', '📚', 'exams_completed', 3),
('Quick Learner', 'Complete 5 exams', '⚡', 'exams_completed', 5),
('Dedicated Student', 'Complete 10 exams', '💪', 'exams_completed', 10),

-- Performance Badges
('Perfect Score', 'Get a perfect 100% score', '🏆', 'perfect_score', 1),
('Excellence Seeker', 'Get 3 perfect scores', '🌟', 'perfect_score', 3),
('Perfection Master', 'Get 5 perfect scores', '👑', 'perfect_score', 5),

-- Streak Badges
('Learning Streak', 'Study for 3 consecutive days', '🔥', 'streak_days', 3),
('Consistent Learner', 'Study for 5 consecutive days', '💯', 'streak_days', 5),
('Unstoppable Force', 'Study for 7 consecutive days', '🚀', 'streak_days', 7),

-- XP Badges
('XP Collector', 'Earn 100 XP points', '💎', 'xp_earned', 100),
('Experience Seeker', 'Earn 300 XP points', '💰', 'xp_earned', 300),
('XP Master', 'Earn 500 XP points', '👑', 'xp_earned', 500),

-- Subject Mastery Badges
('Math Master', 'Complete 3 Mathematics exams', '🧮', 'subject_mastery', 3),
('English Expert', 'Complete 3 English exams', '📖', 'subject_mastery', 3),
('Science Specialist', 'Complete 3 Science exams', '🧪', 'subject_mastery', 3),
('History Hero', 'Complete 3 History exams', '🏛️', 'subject_mastery', 3),
('BM Champion', 'Complete 3 Bahasa Melayu exams', '🗣️', 'subject_mastery', 3)

ON CONFLICT (name) DO NOTHING; -- Prevent duplicates if badges already exist

-- Verify the badges were created
SELECT 
    name, 
    description, 
    icon, 
    condition_type, 
    condition_value,
    created_at 
FROM badges 
ORDER BY condition_type, condition_value, created_at;