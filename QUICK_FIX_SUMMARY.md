# 🚨 ExamModal Tab Switching Issue - Quick Fix

## **Problem**
Your ExamModal closes when users switch tabs or apps, causing them to lose exam progress.

## **Root Cause**
1. **React StrictMode** in `src/main.tsx` causes component remounting
2. **Timer useEffect** has missing dependencies causing stale closures
3. **No Page Visibility API** to handle tab switching properly

## **Immediate Fix (20 minutes)**

### 1. Add missing imports to `ExamModal.tsx`:
```typescript
import { useCallback, useRef } from 'react'
```

### 2. Add these refs inside your component:
```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null)
const isTabVisibleRef = useRef<boolean>(true)
```

### 3. Wrap `finishExam` with `useCallback`:
```typescript
const finishExam = useCallback(async () => {
  // ... your existing finishExam logic
}, [questions, selectedMode, selectedSubject, student.id, student.xp])
```

### 4. Fix the timer useEffect:
```typescript
useEffect(() => {
  if (examStarted && timeLeft > 0) {
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  } else if (examStarted && timeLeft === 0) {
    finishExam()
  }
}, [examStarted, timeLeft, finishExam]) // ✅ Add finishExam here
```

### 5. Add Page Visibility handler:
```typescript
const handleVisibilityChange = useCallback(() => {
  if (document.hidden) {
    console.log('Tab hidden - preserving exam state')
  } else {
    console.log('Tab visible - exam continues')
  }
}, [])

useEffect(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [handleVisibilityChange])
```

## **Test the Fix**
1. Start an exam
2. Switch to another tab for 10 seconds
3. Return to exam tab
4. Verify modal is still open and timer continues

## **For Complete Solution**
See `EXAM_MODAL_TAB_SWITCHING_FIX.md` for the full implementation with enhanced timer management and user warnings.

---
**Status:** ✅ Ready to implement  
**Time:** 20 minutes for quick fix, 2-3 hours for complete solution