-- Comprehensive Badge System
-- This creates badges for all the achievements students can earn

-- Clear existing badges to start fresh (optional)
-- DELETE FROM badges WHERE condition_type IN ('first_exam', 'exams_completed', 'perfect_score', 'score_range', 'xp_earned', 'subject_mastery', 'streak_days');

-- Insert comprehensive badge set
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES

-- First Achievement Badges
('First Steps', 'Complete your first exam', '🎯', 'first_exam', 1),
('Beginner', 'Complete 3 exams', '📚', 'exams_completed', 3),
('Quick Learner', 'Complete 5 exams', '⚡', 'exams_completed', 5),
('Dedicated Student', 'Complete 10 exams', '💪', 'exams_completed', 10),
('Exam Master', 'Complete 20 exams', '🎓', 'exams_completed', 20),

-- Perfect Score Badges
('Perfect Score', 'Get your first 100% score', '🏆', 'perfect_score', 1),
('Excellence Seeker', 'Get 3 perfect scores', '🌟', 'perfect_score', 3),
('Perfection Master', 'Get 5 perfect scores', '👑', 'perfect_score', 5),

-- Score Performance Badges (we'll need to add this condition type)
('Top Performer', 'Score 90% or higher', '🏅', 'score_range', 90),
('Smart Cookie', 'Score 80% or higher', '🍪', 'score_range', 80),
('Rising Star', 'Score 70% or higher', '⭐', 'score_range', 70),

-- XP Achievement Badges
('XP Collector', 'Earn 100 XP points', '💎', 'xp_earned', 100),
('Experience Seeker', 'Earn 300 XP points', '💰', 'xp_earned', 300),
('XP Master', 'Earn 500 XP points', '🎖️', 'xp_earned', 500),
('XP Legend', 'Earn 1000 XP points', '👑', 'xp_earned', 1000),

-- Subject Mastery Badges
('Math Master', 'Complete 3 Mathematics exams', '🧮', 'subject_mastery', 3),
('English Expert', 'Complete 3 English exams', '📖', 'subject_mastery', 3),
('Science Specialist', 'Complete 3 Science exams', '🧪', 'subject_mastery', 3),
('History Hero', 'Complete 3 History exams', '🏛️', 'subject_mastery', 3),
('BM Champion', 'Complete 3 Bahasa Melayu exams', '🗣️', 'subject_mastery', 3),

-- Learning Streak Badges
('Learning Streak', 'Study for 3 consecutive days', '🔥', 'streak_days', 3),
('Consistent Learner', 'Study for 5 consecutive days', '💯', 'streak_days', 5),
('Unstoppable Force', 'Study for 7 consecutive days', '🚀', 'streak_days', 7)

ON CONFLICT (name) DO NOTHING; -- Prevent duplicates if badges already exist

-- Display all created badges
SELECT 
    name, 
    description, 
    icon, 
    condition_type, 
    condition_value,
    created_at 
FROM badges 
ORDER BY condition_type, condition_value, created_at;