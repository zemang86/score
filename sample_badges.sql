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

-- Progressive Tiered Badges for Enhanced Learning Motivation
-- Run this script to insert comprehensive tiered badges that students can earn as they progress

-- Clear existing sample badges (optional - uncomment if needed)
-- DELETE FROM badges WHERE name LIKE '%Quick Learner%' OR name LIKE '%Perfect Score%' OR name LIKE '%XP Collector%';

-- Insert progressive tiered badges for comprehensive motivation
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES

-- First Achievement Badge (One-time only)
('First Steps', 'Complete your first exam', '🎯', 'first_exam', 1),

-- Progressive Exam Completion Badges
('Quick Learner I', 'Complete 3 exams', '⚡', 'exams_completed', 3),
('Quick Learner II', 'Complete 5 exams', '⚡⚡', 'exams_completed', 5),
('Quick Learner III', 'Complete 10 exams', '⚡⚡⚡', 'exams_completed', 10),
('Dedicated Student', 'Complete 25 exams', '💪', 'exams_completed', 25),
('Academic Champion', 'Complete 50 exams', '🏆', 'exams_completed', 50),
('Learning Legend', 'Complete 100 exams', '👑', 'exams_completed', 100),

-- Progressive Perfect Score Badges
('Perfect Score I', 'Get 1 perfect 100% score', '🌟', 'perfect_score', 1),
('Perfect Score II', 'Get 3 perfect 100% scores', '🌟🌟', 'perfect_score', 3),
('Perfect Score III', 'Get 5 perfect 100% scores', '🌟🌟🌟', 'perfect_score', 5),
('Perfectionist', 'Get 10 perfect 100% scores', '👑', 'perfect_score', 10),
('Excellence Master', 'Get 20 perfect 100% scores', '💎', 'perfect_score', 20),

-- Progressive XP Badges
('XP Collector I', 'Earn 100 XP points', '💎', 'xp_earned', 100),
('XP Collector II', 'Earn 300 XP points', '💎💎', 'xp_earned', 300),
('XP Collector III', 'Earn 500 XP points', '💎💎💎', 'xp_earned', 500),
('XP Master', 'Earn 1000 XP points', '💰', 'xp_earned', 1000),
('XP Legend', 'Earn 2000 XP points', '👑', 'xp_earned', 2000),
('XP Grandmaster', 'Earn 5000 XP points', '🏆', 'xp_earned', 5000),

-- Progressive Learning Streak Badges
('Learning Streak I', 'Study for 3 consecutive days', '🔥', 'streak_days', 3),
('Learning Streak II', 'Study for 5 consecutive days', '🔥🔥', 'streak_days', 5),
('Learning Streak III', 'Study for 7 consecutive days', '🔥🔥🔥', 'streak_days', 7),
('Unstoppable Force', 'Study for 14 consecutive days', '🚀', 'streak_days', 14),
('Consistency King', 'Study for 30 consecutive days', '👑', 'streak_days', 30),

-- Progressive Subject Mastery Badges
('Subject Explorer', 'Complete 3 exams in any subject', '🧭', 'subject_mastery', 3),
('Subject Specialist', 'Complete 5 exams in any subject', '🎓', 'subject_mastery', 5),
('Subject Master', 'Complete 10 exams in any subject', '🏆', 'subject_mastery', 10),
('Subject Grandmaster', 'Complete 20 exams in any subject', '👑', 'subject_mastery', 20),

-- Bonus Achievement Badges
('High Achiever', 'Score 90% or higher on any exam', '🎖️', 'score_range', 90),
('Excellence Seeker', 'Score 95% or higher on any exam', '🏅', 'score_range', 95),
('Genius Mode', 'Score 98% or higher on any exam', '🧠', 'score_range', 98)

ON CONFLICT (name) DO NOTHING; -- Prevent duplicates if badges already exist

-- Verify the progressive badges were created
SELECT 
    condition_type,
    COUNT(*) as badge_count,
    string_agg(name || ' (' || condition_value || ')', ', ' ORDER BY condition_value) as badges
FROM badges 
WHERE condition_type IN ('exams_completed', 'perfect_score', 'xp_earned', 'streak_days', 'subject_mastery')
GROUP BY condition_type
ORDER BY condition_type;

-- Show all badges ordered by type and value
SELECT 
    name, 
    description, 
    icon, 
    condition_type, 
    condition_value,
    created_at 
FROM badges 
ORDER BY condition_type, condition_value, created_at;