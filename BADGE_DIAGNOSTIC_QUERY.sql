-- Badge System Diagnostic Queries
-- Run these in your Supabase SQL editor to check badge status

-- 1. Check total badge count and see if progressive badges exist
SELECT 
  COUNT(*) as total_badges,
  COUNT(CASE WHEN name LIKE '%Quick Learner I%' THEN 1 END) as has_progressive_exam_badges,
  COUNT(CASE WHEN name LIKE '%Perfect Score I%' THEN 1 END) as has_progressive_perfect_badges
FROM badges;

-- 2. See all badges grouped by type
SELECT 
  condition_type,
  COUNT(*) as badge_count,
  string_agg(name || ' (' || condition_value || ')', ', ' ORDER BY condition_value) as badges
FROM badges 
GROUP BY condition_type
ORDER BY condition_type;

-- 3. Check student badge counts (should show current 16 vs new total)
SELECT 
  s.name as student_name,
  COUNT(sb.id) as badges_earned
FROM students s
LEFT JOIN student_badges sb ON s.id = sb.student_id
GROUP BY s.id, s.name
ORDER BY badges_earned DESC;

-- 4. Show recently earned badges
SELECT 
  s.name as student_name,
  b.name as badge_name,
  b.condition_type,
  b.condition_value,
  sb.earned_at
FROM student_badges sb
JOIN badges b ON sb.badge_id = b.id
JOIN students s ON sb.student_id = s.id
ORDER BY sb.earned_at DESC
LIMIT 10;

-- 5. Show missing progressive badges (run this BEFORE the fix)
WITH progressive_badges AS (
  SELECT name FROM (VALUES 
    ('Quick Learner I'),
    ('Quick Learner II'), 
    ('Quick Learner III'),
    ('Perfect Score I'),
    ('Perfect Score II'),
    ('XP Collector I'),
    ('XP Collector II'),
    ('Subject Explorer'),
    ('Learning Streak I')
  ) AS t(name)
)
SELECT 
  pb.name as missing_badge
FROM progressive_badges pb
LEFT JOIN badges b ON pb.name = b.name
WHERE b.name IS NULL;

-- 6. Check if student is eligible for perfect score badge (100% score)
SELECT 
  s.name as student_name,
  COUNT(CASE WHEN e.score = 100 THEN 1 END) as perfect_scores,
  CASE 
    WHEN COUNT(CASE WHEN e.score = 100 THEN 1 END) >= 1 THEN '✅ Eligible for Perfect Score I'
    ELSE '❌ No perfect scores yet'
  END as perfect_badge_status
FROM students s
LEFT JOIN exams e ON s.id = e.student_id AND e.completed = true
GROUP BY s.id, s.name
ORDER BY perfect_scores DESC;