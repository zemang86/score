# Badge System Troubleshooting Guide

## Problem
Student completed 3 exams in the same subject but didn't receive a subject mastery badge.

## Debugging Steps

### 1. Open Browser Console
- Press F12 or Ctrl+Shift+I
- Go to the Console tab

### 2. Run Test Function
```javascript
testBadgeSystem()
```

This will check:
- If badges exist in database
- Student's exam breakdown by subject
- Which badges should be earned
- Which badges are already earned

### 3. Run Debug Function
```javascript
debugBadgeEvaluationForStudent("YOUR_STUDENT_ID")
```

Replace `YOUR_STUDENT_ID` with actual student ID (shown in test output).

### 4. Manual Badge Evaluation
If needed, manually trigger badge evaluation:
```javascript
BadgeEvaluator.evaluateAndAwardBadges("YOUR_STUDENT_ID")
```

## Common Issues

### 1. No Badges in Database
**Symptom:** "Found 0 active badges"
**Solution:** Run the sample badge creation SQL

### 2. Badge Not Active
**Symptom:** Badge exists but not awarded
**Solution:** Check if badge has `is_active = true`

### 3. Wrong Condition Value
**Symptom:** Student has 3 exams but badge requires 5
**Solution:** Update badge condition_value to match requirement

### 4. Badge Already Earned
**Symptom:** Badge shows as "Already earned"
**Solution:** This is normal - badges are only earned once

### 5. Subject Mastery Logic Error
**Symptom:** Student has 3+ exams in same subject but no badge
**Solution:** Check console output for subject breakdown

## Expected Behavior

For subject mastery badges:
- Student completes 3 Math exams → Should earn "Math Expert" badge (if condition_value = 3)
- Student completes 5 Science exams → Should earn "Science Master" badge (if condition_value = 5)
- The system checks the MAX exams in ANY subject

## Debug Output Explanation

```
📚 Subject breakdown for student: { Math: 3, Science: 2, English: 1 }
🎯 Max exams in any subject: 3 (calculated from 3, 2, 1)
🔍 Subject mastery check: student has 3 max exams in any subject, badge requires 3
✅ QUALIFIES for Math Expert badge
```

## Files Modified

- `src/utils/badgeEvaluator.ts` - Badge evaluation logic
- `src/components/ExamModal.tsx` - Badge awarding after exam
- `src/components/StudentProgressModal.tsx` - Badge display

## Next Steps

1. Run the test function to identify the specific issue
2. If badges are missing, create them using the sample SQL
3. If logic is wrong, the debug output will show the calculation
4. If still not working, check the database directly using the SQL queries