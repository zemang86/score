# ExamModal Tab Switching Issue - Complete Fix Guide

## 🐛 **Problem Description**

The ExamModal closes/resets when users switch tabs or change to different apps, causing them to lose their exam progress. This is a critical UX issue that affects the exam experience.

## 🔍 **Root Causes Identified**

### 1. **React StrictMode** (Primary Issue)
- Your app uses `<StrictMode>` in `src/main.tsx` 
- StrictMode intentionally double-renders components in development
- Causes components to mount, unmount, and remount
- This triggers state resets when tab regains focus

### 2. **Timer useEffect Dependency Issue**
```typescript
// Current problematic code in ExamModal.tsx
useEffect(() => {
  if (examStarted && timeLeft > 0) {
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  } else if (examStarted && timeLeft === 0) {
    finishExam() // ❌ Not in dependency array - stale closure!
  }
}, [examStarted, timeLeft]) // ❌ Missing finishExam dependency
```

### 3. **Browser Tab Behavior**
- Browsers pause/throttle JavaScript execution in background tabs
- `setTimeout`/`setInterval` become unreliable when tab is hidden
- Component may unmount when browser optimizes memory

### 4. **Missing Page Visibility API**
- No handling for when users switch tabs
- Timer continues incorrectly or stops unexpectedly
- No state preservation during tab switches

## 🛠 **Complete Fix Implementation**

### **Step 1: Fix Timer Management**

Replace the timer logic in your `ExamModal.tsx`:

```typescript
// Add these imports at the top
import { useCallback, useRef } from 'react'

// Add these refs inside your component
const timerRef = useRef<NodeJS.Timeout | null>(null)
const isTabVisibleRef = useRef<boolean>(true)

// Replace the timer functions with these:
const startTimer = useCallback(() => {
  if (timerRef.current) {
    clearInterval(timerRef.current)
  }

  timerRef.current = setInterval(() => {
    setTimeLeft((prevTime) => {
      const newTime = prevTime - 1
      if (newTime <= 0) {
        return 0
      }
      return newTime
    })
  }, 1000)
}, [])

const stopTimer = useCallback(() => {
  if (timerRef.current) {
    clearInterval(timerRef.current)
    timerRef.current = null
  }
}, [])

// Wrap finishExam with useCallback
const finishExam = useCallback(async () => {
  console.log('🏁 Finishing exam...')
  setExamStarted(false)
  stopTimer()
  
  // ... rest of your existing finishExam logic
}, [questions, selectedMode, selectedSubject, student.id, student.xp, stopTimer])
```

### **Step 2: Add Page Visibility API**

Add this visibility handler:

```typescript
// Handle page visibility changes to pause/resume timer
const handleVisibilityChange = useCallback(() => {
  if (document.hidden) {
    // Tab is now hidden - pause timer
    isTabVisibleRef.current = false
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    console.log('📱 Tab hidden - timer paused')
  } else {
    // Tab is now visible - resume timer
    isTabVisibleRef.current = true
    if (examStarted && timeLeft > 0) {
      console.log('📱 Tab visible - resuming timer')
      startTimer()
    }
  }
}, [examStarted, timeLeft, startTimer])

// Set up page visibility listener
useEffect(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [handleVisibilityChange])
```

### **Step 3: Fix Timer useEffect**

Replace the existing timer useEffect with:

```typescript
// Enhanced timer effect that handles tab switching
useEffect(() => {
  if (examStarted && timeLeft > 0 && isTabVisibleRef.current) {
    startTimer()
  } else if (examStarted && timeLeft <= 0) {
    finishExam()
  } else {
    stopTimer()
  }

  return () => {
    stopTimer()
  }
}, [examStarted, timeLeft, startTimer, stopTimer, finishExam])

// Clean up on component unmount
useEffect(() => {
  return () => {
    stopTimer()
  }
}, [stopTimer])
```

### **Step 4: Add User Warning**

Add this warning component inside your modal during exam:

```typescript
// Warning message for tab switching
const TabSwitchWarning = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
      <div>
        <p className="text-yellow-700 font-medium text-sm">
          Stay focused! 
        </p>
        <p className="text-yellow-600 text-xs">
          The timer continues even if you switch tabs or apps. Your progress is automatically saved.
        </p>
      </div>
    </div>
  </div>
)

// Add this to your exam step JSX:
{step === 'exam' && <TabSwitchWarning />}
```

### **Step 5: Enhanced Timer Display**

Update your timer display to show warning when time is low:

```typescript
{/* Timer for exam step */}
{step === 'exam' && (
  <div className={`text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-md mx-3 flex-shrink-0 ${
    timeLeft <= 60 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
  }`}>
    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
    <span className="font-bold text-xs sm:text-sm">{formatTime(timeLeft)}</span>
  </div>
)}
```

## 🚀 **Alternative Solution (If StrictMode Issues Persist)**

If the above fixes don't completely resolve the issue, you can temporarily disable StrictMode for production:

```typescript
// In src/main.tsx
createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
);
```

## 🧪 **Testing the Fix**

1. **Start an exam**
2. **Switch to another tab** for 10-15 seconds
3. **Return to the exam tab**
4. **Verify:**
   - Modal is still open
   - Timer continues from where it left off
   - User answers are preserved
   - No component reset

## 📊 **Expected Results**

After implementing these fixes:

- ✅ **Modal stays open** when switching tabs
- ✅ **Timer pauses/resumes** properly
- ✅ **User answers preserved** during tab switches
- ✅ **Better user experience** with clear warnings
- ✅ **No unexpected resets** or modal closures

## 🔄 **Implementation Priority**

### High Priority (Immediate)
1. Fix timer useEffect dependencies
2. Add Page Visibility API handling
3. Add user warning message

### Medium Priority (Next Update)
1. Enhanced timer display
2. Progress persistence
3. Better error handling

### Low Priority (Future Enhancement)
1. Offline exam capability
2. Advanced timer features
3. Cross-tab synchronization

## 💡 **Additional Recommendations**

1. **Consider Local Storage**: Save exam state to localStorage for complete persistence
2. **Add Beforeunload Warning**: Warn users before accidentally closing the tab
3. **Implement Heartbeat**: Regular checks to ensure exam state is maintained
4. **Add Analytics**: Track tab switching behavior to understand user patterns

## 🐛 **Common Gotchas**

1. **Don't forget useCallback**: All functions in useEffect deps need useCallback
2. **Clean up listeners**: Always remove event listeners in cleanup
3. **Test in production**: StrictMode behavior differs between dev/prod
4. **Cross-browser testing**: Safari handles page visibility differently

---

**Status:** ✅ **Ready for implementation** - Follow steps 1-5 in order for complete fix

**Estimated Time:** 2-3 hours implementation + testing

**Risk Level:** 🟢 **Low** - Non-breaking changes, backwards compatible