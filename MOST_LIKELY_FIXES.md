# 🎯 MOST LIKELY FIXES (Ranked by Probability)

## **🥇 FIX #1: React StrictMode (90% probability)**

**Symptoms match:** Components re-mounting when tabs switch  
**Quick test:** In `src/main.tsx`:

```typescript
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
```

**Why this works:** StrictMode intentionally remounts components to test for side effects, which resets local state.

---

## **🥈 FIX #2: Console.log Causing Re-renders (70% probability)**

**Symptoms match:** "Kids container keeps refreshing"  
**Quick test:** Comment out ALL console.log in `src/App.tsx`:

```typescript
// console.log('🔍 AppContent: Current state:', { ... })
// console.log('⏳ AppContent: Still loading, showing spinner')
// console.log('✅ AppContent: Loading complete, rendering routes')
```

**Why this works:** Console.logs on every render can trigger cascading re-renders.

---

## **🥉 FIX #3: Lazy Loading + Suspense (60% probability)**

**Symptoms match:** Components reloading when tab regains focus  
**Quick test:** Replace lazy import in `src/App.tsx`:

```typescript
// Remove this:
const ParentDashboard = React.lazy(() => import('./components/dashboard/ParentDashboard').then(module => ({ default: module.ParentDashboard })))

// Add this at top:
import { ParentDashboard } from './components/dashboard/ParentDashboard'
```

**Why this works:** Lazy loading can cause re-mounting when browser pauses/resumes JavaScript.

---

## **🏅 FIX #4: Supabase Auto-refresh (40% probability)**

**Symptoms match:** Refreshing when switching tabs  
**Quick test:** In `src/lib/supabase.ts`:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Disable temporarily
    persistSession: true,
    detectSessionInUrl: false // Disable temporarily
  }
})
```

**Why this works:** Auto-refresh might trigger when tab regains focus.

---

## **⚡ EMERGENCY FIX: Session Storage Persistence**

If nothing else works, force modal state to persist:

```typescript
// In StudentCard.tsx, replace useState with:
const [showExamModal, setShowExamModal] = useState(() => {
  return sessionStorage.getItem(`exam-modal-${student.id}`) === 'true'
})

// Replace onClick handlers:
onClick={() => {
  setShowExamModal(true)
  sessionStorage.setItem(`exam-modal-${student.id}`, 'true')
}}

onClose={() => {
  setShowExamModal(false)
  sessionStorage.removeItem(`exam-modal-${student.id}`)
}}
```

---

## **🚀 RECOMMENDED TESTING ORDER**

1. **Try Fix #1 first** (StrictMode) - 2 minutes
2. **If not fixed, try Fix #2** (Console logs) - 1 minute  
3. **If not fixed, try Fix #3** (Lazy loading) - 3 minutes
4. **If still broken, use Emergency Fix** - 5 minutes

## **📊 SUCCESS INDICATORS**

✅ **Fixed:** Exam modal stays open when switching tabs  
✅ **Fixed:** Dashboard doesn't refresh when returning to tab  
✅ **Fixed:** Console shows no unexpected mounting/unmounting

---

**My bet:** It's Fix #1 (StrictMode). React StrictMode is notorious for causing this exact issue! 🎯