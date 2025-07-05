-- Badge System Troubleshooting Queries
-- Run these queries to diagnose badge system issues

-- 1. Check if any badges exist in the database
SELECT 
    COUNT(*) as total_badges,
    'badges created' as status
FROM badges;

-- 2. List all available badges
SELECT 
    id,
    name, 
    description, 
    icon, 
    condition_type, 
    condition_value,
    created_at 
FROM badges 
ORDER BY condition_type, condition_value;

-- 3. Check if any student badges have been awarded
SELECT 
    COUNT(*) as total_student_badges,
    'badges awarded to students' as status
FROM student_badges;

-- 4. List awarded badges with details
SELECT 
    sb.id,
    sb.student_id,
    s.name as student_name,
    b.name as badge_name,
    b.condition_type,
    b.condition_value,
    sb.earned_at
FROM student_badges sb
JOIN badges b ON sb.badge_id = b.id
JOIN students s ON sb.student_id = s.id
ORDER BY sb.earned_at DESC;

-- 5. Check student exam statistics (for badge condition evaluation)
SELECT 
    s.id,
    s.name as student_name,
    s.xp,
    COUNT(e.id) as total_exams,
    COUNT(CASE WHEN e.score = 100 THEN 1 END) as perfect_scores,
    ROUND(AVG(e.score), 2) as average_score,
    MAX(e.score) as best_score
FROM students s
LEFT JOIN exams e ON s.id = e.student_id AND e.completed = true
GROUP BY s.id, s.name, s.xp
ORDER BY s.name;

-- 6. Check recent exam completions
SELECT 
    e.id,
    s.name as student_name,
    e.subject,
    e.mode,
    e.score,
    e.completed,
    e.created_at
FROM exams e
JOIN students s ON e.student_id = s.id
WHERE e.completed = true
ORDER BY e.created_at DESC
LIMIT 10;