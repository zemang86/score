-- Badge Status Check Queries
-- Run these in your Supabase SQL editor to see what's happening

-- 1. CHECK: What badges exist in your system
SELECT 
    name, 
    description, 
    icon, 
    condition_type, 
    condition_value,
    created_at
FROM badges 
ORDER BY condition_type, condition_value;

-- 2. CHECK: Student achievements vs badge requirements
SELECT 
    s.id,
    s.name as student_name,
    s.level,
    s.xp,
    -- Count total completed exams
    COUNT(e.id) as total_exams,
    -- Count perfect scores (100%)
    COUNT(CASE WHEN e.score = 100 THEN 1 END) as perfect_scores,
    -- Calculate average score
    ROUND(AVG(e.score), 2) as average_score,
    -- Get best score
    MAX(e.score) as best_score,
    -- Count badges already earned
    (SELECT COUNT(*) FROM student_badges sb WHERE sb.student_id = s.id) as badges_earned
FROM students s
LEFT JOIN exams e ON s.id = e.student_id AND e.completed = true
GROUP BY s.id, s.name, s.level, s.xp
ORDER BY s.name;

-- 3. CHECK: Which badges each student SHOULD qualify for
WITH student_stats AS (
    SELECT 
        s.id,
        s.name,
        s.xp,
        COUNT(e.id) as total_exams,
        COUNT(CASE WHEN e.score = 100 THEN 1 END) as perfect_scores,
        -- Check if they've completed their first exam
        CASE WHEN COUNT(e.id) > 0 THEN true ELSE false END as has_first_exam
    FROM students s
    LEFT JOIN exams e ON s.id = e.student_id AND e.completed = true
    GROUP BY s.id, s.name, s.xp
),
badge_qualifications AS (
    SELECT 
        ss.id as student_id,
        ss.name as student_name,
        b.id as badge_id,
        b.name as badge_name,
        b.condition_type,
        b.condition_value,
        CASE 
            WHEN b.condition_type = 'first_exam' AND ss.has_first_exam THEN true
            WHEN b.condition_type = 'exams_completed' AND ss.total_exams >= b.condition_value THEN true
            WHEN b.condition_type = 'perfect_score' AND ss.perfect_scores >= b.condition_value THEN true
            WHEN b.condition_type = 'xp_earned' AND ss.xp >= b.condition_value THEN true
            ELSE false
        END as qualifies,
        -- Check if already earned
        CASE WHEN sb.id IS NOT NULL THEN true ELSE false END as already_earned
    FROM student_stats ss
    CROSS JOIN badges b
    LEFT JOIN student_badges sb ON ss.id = sb.student_id AND b.id = sb.badge_id
)
SELECT 
    student_name,
    badge_name,
    condition_type,
    condition_value,
    qualifies,
    already_earned,
    CASE 
        WHEN qualifies AND NOT already_earned THEN '🎯 SHOULD EARN'
        WHEN qualifies AND already_earned THEN '✅ ALREADY HAS'
        ELSE '❌ NOT QUALIFIED'
    END as status
FROM badge_qualifications
ORDER BY student_name, qualifies DESC, condition_type;

-- 4. CHECK: Missing badges (should have but don't)
WITH student_stats AS (
    SELECT 
        s.id,
        s.name,
        s.xp,
        COUNT(e.id) as total_exams,
        COUNT(CASE WHEN e.score = 100 THEN 1 END) as perfect_scores,
        CASE WHEN COUNT(e.id) > 0 THEN true ELSE false END as has_first_exam
    FROM students s
    LEFT JOIN exams e ON s.id = e.student_id AND e.completed = true
    GROUP BY s.id, s.name, s.xp
)
SELECT 
    ss.name as student_name,
    b.name as missing_badge,
    b.condition_type,
    b.condition_value,
    CASE 
        WHEN b.condition_type = 'first_exam' THEN CONCAT('Has completed ', ss.total_exams, ' exams')
        WHEN b.condition_type = 'exams_completed' THEN CONCAT('Has completed ', ss.total_exams, ' of ', b.condition_value, ' required exams')
        WHEN b.condition_type = 'perfect_score' THEN CONCAT('Has ', ss.perfect_scores, ' of ', b.condition_value, ' perfect scores')
        WHEN b.condition_type = 'xp_earned' THEN CONCAT('Has ', ss.xp, ' of ', b.condition_value, ' required XP')
    END as student_progress
FROM student_stats ss
CROSS JOIN badges b
WHERE (
    (b.condition_type = 'first_exam' AND ss.has_first_exam) OR
    (b.condition_type = 'exams_completed' AND ss.total_exams >= b.condition_value) OR
    (b.condition_type = 'perfect_score' AND ss.perfect_scores >= b.condition_value) OR
    (b.condition_type = 'xp_earned' AND ss.xp >= b.condition_value)
)
AND NOT EXISTS (
    SELECT 1 FROM student_badges sb 
    WHERE sb.student_id = ss.id AND sb.badge_id = b.id
)
ORDER BY ss.name, b.condition_type;

-- 5. CHECK: Subject mastery progress
SELECT 
    s.name as student_name,
    e.subject,
    COUNT(*) as exams_in_subject,
    CASE WHEN COUNT(*) >= 3 THEN '🏆 QUALIFIED for Subject Master' ELSE '📚 Needs more exams' END as subject_master_status
FROM students s
JOIN exams e ON s.id = e.student_id AND e.completed = true
GROUP BY s.id, s.name, e.subject
HAVING COUNT(*) > 0
ORDER BY s.name, COUNT(*) DESC;

-- 6. CHECK: Recent exam activity (for streak calculation)
SELECT 
    s.name as student_name,
    DATE(e.created_at) as exam_date,
    COUNT(*) as exams_that_day
FROM students s
JOIN exams e ON s.id = e.student_id AND e.completed = true
WHERE e.created_at >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY s.id, s.name, DATE(e.created_at)
ORDER BY s.name, exam_date DESC;