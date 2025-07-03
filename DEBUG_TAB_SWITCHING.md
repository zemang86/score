# 🕵️ COMPLETE DEBUG: Exam Modal Tab Switching Issue

## **Let's Find the Real Culprit**

Since the AuthContext fix didn't work, let's systematically debug this. Here are ALL possible causes:

## 🔍 **Step 1: Enable Debug Mode**

Add this to your browser console to track what's happening:

```javascript
// Run this in browser console to track re-renders
let componentMounts = 0;
let tabSwitches = 0;

// Override console.log to track renders
const originalLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes('AppContent') || args[0]?.includes('ParentDashboard')) {
    originalLog(`[${new Date().toISOString()}] RENDER:`, ...args);
  }
  originalLog(...args);
};

// Track visibility changes
document.addEventListener('visibilitychange', () => {
  tabSwitches++;
  originalLog(`🔄 Tab switch #${tabSwitches} - Hidden: ${document.hidden}`);
});

originalLog('🐛 Debug mode enabled - tracking renders and tab switches');
```

## 🎯 **Step 2: Quick Diagnosis Tests**

Try these **one by one** and tell me which one fixes it:

### **Test 1: Disable React StrictMode** (Most Likely Fix)
In `src/main.tsx`:
```typescript
// COMMENT OUT StrictMode temporarily
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
```

### **Test 2: Remove Console Logs**
In `src/App.tsx`, comment out ALL console.log statements:
```typescript
function AppContent() {
  const { user, isAdmin, loading } = useAuth()

  // console.log('🔍 AppContent: Current state:', { 
  //   hasUser: !!user, 
  //   userEmail: user?.email,
  //   isAdmin, 
  //   loading 
  // })

  if (loading) {
    // console.log('⏳ AppContent: Still loading, showing spinner')
    return <LoadingSpinner />
  }

  // console.log('✅ AppContent: Loading complete, rendering routes')
  // ... rest of component
}
```

### **Test 3: Disable Lazy Loading**
In `src/App.tsx`, replace lazy imports with regular imports:
```typescript
// Replace this:
const ParentDashboard = React.lazy(() => import('./components/dashboard/ParentDashboard').then(module => ({ default: module.ParentDashboard })))

// With this:
import { ParentDashboard } from './components/dashboard/ParentDashboard'

// Remove Suspense wrapper and use direct component
<ParentDashboard />
```

### **Test 4: Add Component Keys**
In `src/App.tsx`, add stable keys:
```typescript
<Route 
  path="/dashboard" 
  element={
    user ? (
      !isAdmin ? <ParentDashboard key={user.id} /> : <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/" replace />
    )
  } 
/>
```

### **Test 5: Check Supabase Auth Settings**
In `src/lib/supabase.ts`, check if auto-refresh is causing issues:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Try disabling this temporarily
    persistSession: true,
    detectSessionInUrl: false // Try disabling this too
  }
})
```

## 🎯 **Step 3: Advanced Debugging**

If none of the above work, add this debugging component:

```typescript
// Add this to src/components/debug/RenderTracker.tsx
import { useEffect, useRef } from 'react'

export function RenderTracker({ name }: { name: string }) {
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())
  
  useEffect(() => {
    renderCount.current++
    console.log(`🔄 ${name} mounted/updated #${renderCount.current} at ${new Date().toISOString()}`)
    
    return () => {
      console.log(`💀 ${name} unmounting after ${Date.now() - mountTime.current}ms`)
    }
  })

  useEffect(() => {
    console.log(`🎯 ${name} first mount at ${new Date().toISOString()}`)
  }, [])

  return null
}
```

Then add it to components:
```typescript
// In ParentDashboard.tsx
import { RenderTracker } from '../debug/RenderTracker'

export function ParentDashboard() {
  return (
    <div>
      <RenderTracker name="ParentDashboard" />
      {/* rest of component */}
    </div>
  )
}

// In StudentCard.tsx  
export function StudentCard({ student, ... }) {
  return (
    <>
      <RenderTracker name={`StudentCard-${student.name}`} />
      {/* rest of component */}
    </>
  )
}
```

## 🎯 **Step 4: Nuclear Option - Session Storage**

If all else fails, let's persist the modal state:

```typescript
// In StudentCard.tsx
const [showExamModal, setShowExamModal] = useState(() => {
  return sessionStorage.getItem(`exam-modal-${student.id}`) === 'true'
})

const handleExamModalOpen = () => {
  setShowExamModal(true)
  sessionStorage.setItem(`exam-modal-${student.id}`, 'true')
}

const handleExamModalClose = () => {
  setShowExamModal(false)
  sessionStorage.removeItem(`exam-modal-${student.id}`)
}

// Use these handlers instead of direct state setters
```

## 📊 **Report Back**

Please try the tests in order and tell me:

1. **Which test number fixes it?** (1, 2, 3, 4, or 5)
2. **What do you see in the console** when you switch tabs?
3. **Does the debug mode show** components mounting/unmounting?

## 🎯 **My Prediction**

I suspect it's **Test 1 (StrictMode)** because:
- StrictMode intentionally double-renders components
- It remounts components to test for side effects
- This commonly causes modal state to reset
- It's the #1 cause of "state mysteriously resets" issues in React

Try Test 1 first - I'm 90% confident that's the culprit! 🎯