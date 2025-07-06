-- Badge Cleanup Script - Remove Duplicates Safely
-- Run these queries in your Supabase SQL editor

-- STEP 1: Identify duplicate badges
-- This shows badges with same name/condition but different descriptions
SELECT 
  name,
  condition_type,
  condition_value,
  COUNT(*) as duplicate_count,
  string_agg(description, ' | ') as all_descriptions,
  string_agg(id::text, ', ') as all_ids
FROM badges 
GROUP BY name, condition_type, condition_value
HAVING COUNT(*) > 1
ORDER BY name;

-- STEP 2: See all badges with their details (to identify what to keep)
SELECT 
  id,
  name,
  description,
  icon,
  condition_type,
  condition_value,
  created_at
FROM badges 
ORDER BY name, created_at;

-- STEP 3: Find badges that are awarded to students (KEEP THESE!)
-- Never delete badges that students have already earned
SELECT DISTINCT
  b.id,
  b.name,
  b.description,
  COUNT(sb.id) as students_who_earned_this
FROM badges b
LEFT JOIN student_badges sb ON b.id = sb.badge_id
GROUP BY b.id, b.name, b.description
HAVING COUNT(sb.id) > 0
ORDER BY b.name;

-- STEP 4: Safe cleanup - Remove duplicates while preserving student awards
-- This removes duplicate badges that have NO student awards
WITH duplicate_badges AS (
  SELECT 
    name,
    condition_type,
    condition_value,
    array_agg(id ORDER BY created_at) as badge_ids,
    COUNT(*) as duplicate_count
  FROM badges 
  GROUP BY name, condition_type, condition_value
  HAVING COUNT(*) > 1
),
badges_to_delete AS (
  SELECT UNNEST(badge_ids[2:]) as badge_id_to_delete
  FROM duplicate_badges
)
SELECT 
  b.id,
  b.name,
  b.description,
  'Will be deleted - duplicate badge with no student awards' as action
FROM badges b
JOIN badges_to_delete btd ON b.id = btd.badge_id_to_delete
LEFT JOIN student_badges sb ON b.id = sb.badge_id
WHERE sb.id IS NULL;  -- Only show badges with no student awards

-- STEP 5: ACTUAL DELETE (run this only after reviewing Step 4)
-- Uncomment the lines below when you're ready to delete
/*
WITH duplicate_badges AS (
  SELECT 
    name,
    condition_type,
    condition_value,
    array_agg(id ORDER BY created_at) as badge_ids,
    COUNT(*) as duplicate_count
  FROM badges 
  GROUP BY name, condition_type, condition_value
  HAVING COUNT(*) > 1
),
badges_to_delete AS (
  SELECT UNNEST(badge_ids[2:]) as badge_id_to_delete
  FROM duplicate_badges
)
DELETE FROM badges 
WHERE id IN (
  SELECT btd.badge_id_to_delete
  FROM badges_to_delete btd
  LEFT JOIN student_badges sb ON btd.badge_id_to_delete = sb.badge_id
  WHERE sb.id IS NULL  -- Only delete badges with no student awards
);
*/

-- STEP 6: Verify cleanup
SELECT 
  name,
  condition_type,
  condition_value,
  COUNT(*) as count_after_cleanup
FROM badges 
GROUP BY name, condition_type, condition_value
HAVING COUNT(*) > 1;  -- Should return no rows after cleanup

-- STEP 7: Final badge count
SELECT 
  COUNT(*) as total_badges_after_cleanup,
  COUNT(DISTINCT name) as unique_badge_names
FROM badges;