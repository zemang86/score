-- Test Subject Mastery Fix
-- Run this to see which students should now get subject mastery badges

SELECT 
    s.name as student_name,
    e.subject,
    COUNT(*) as exams_in_subject,
    CASE 
        WHEN COUNT(*) >= 3 THEN '🏆 SHOULD GET SUBJECT BADGE'
        ELSE '📚 Need more exams'
    END as status
FROM students s
JOIN exams e ON s.id = e.student_id AND e.completed = true
GROUP BY s.id, s.name, e.subject
HAVING COUNT(*) >= 3  -- Only show subjects where they qualify
ORDER BY s.name, COUNT(*) DESC;

-- Check which subject mastery badges exist
SELECT 
    name,
    description, 
    condition_type,
    condition_value
FROM badges 
WHERE condition_type = 'subject_mastery'
ORDER BY condition_value;