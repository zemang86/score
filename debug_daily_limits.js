// 🧪 DAILY EXAM LIMIT DEBUG SCRIPT
// Copy and paste this into your browser console while logged in to test the fix

console.log('🔍 DAILY EXAM LIMIT DEBUG - Starting Analysis...')
console.log('================================================')

// Check if we're in the React app
if (window.React) {
  console.log('✅ React app detected')
} else {
  console.log('❌ Not in React app - make sure you\'re on the main app page')
  return
}

// Try to access auth context through the window (this might not work in all setups)
// You'll need to manually check these values in your component
console.log('📊 WHAT TO CHECK MANUALLY:')
console.log('1. Open React DevTools')
console.log('2. Find a component that uses useAuth() hook')
console.log('3. Check these values in the auth context:')
console.log('')
console.log('📋 Expected Values for FREE users:')
console.log('   subscriptionPlan: "free"')
console.log('   dailyExamLimit: 3')
console.log('   effectiveAccess.dailyExamLimit: 3')
console.log('   effectiveAccess.hasUnlimitedAccess: false')
console.log('')
console.log('📋 Expected Values for PREMIUM users (with active Stripe subscription):')
console.log('   subscriptionPlan: "premium"') 
console.log('   dailyExamLimit: 999')
console.log('   effectiveAccess.dailyExamLimit: 999')
console.log('   effectiveAccess.hasUnlimitedAccess: true')
console.log('')

// Check localStorage for any cached data
console.log('💾 LOCAL STORAGE CHECK:')
const authKeys = Object.keys(localStorage).filter(key => 
  key.includes('auth') || key.includes('supabase') || key.includes('subscription')
)

if (authKeys.length > 0) {
  console.log('Found auth-related localStorage keys:', authKeys)
  authKeys.forEach(key => {
    console.log(`${key}:`, localStorage.getItem(key))
  })
} else {
  console.log('No auth-related localStorage found')
}

// Check sessionStorage 
console.log('📝 SESSION STORAGE CHECK:')
const sessionKeys = Object.keys(sessionStorage).filter(key => 
  key.includes('exam') || key.includes('auth') || key.includes('student')
)

if (sessionKeys.length > 0) {
  console.log('Found exam-related sessionStorage keys:', sessionKeys)
  sessionKeys.forEach(key => {
    console.log(`${key}:`, sessionStorage.getItem(key))
  })
} else {
  console.log('No exam-related sessionStorage found')
}

// Check for common elements that should show daily limits
console.log('🎯 UI ELEMENT CHECK:')
const limitTexts = Array.from(document.querySelectorAll('*'))
  .filter(el => el.textContent && (
    el.textContent.includes('Daily Exams:') ||
    el.textContent.includes('/3') ||
    el.textContent.includes('/999') ||
    el.textContent.includes('Limit Reached') ||
    el.textContent.includes('Start Exam')
  ))
  .map(el => el.textContent.trim())

if (limitTexts.length > 0) {
  console.log('Found limit-related text in UI:')
  limitTexts.forEach(text => console.log(`  "${text}"`))
} else {
  console.log('No limit-related text found in current UI')
}

console.log('')
console.log('🔧 TROUBLESHOOTING STEPS:')
console.log('1. If you see dailyExamLimit: 999 for a free user → Issue still exists')
console.log('2. If you see "Daily Exams: X/999" → Issue still exists') 
console.log('3. If you see dailyExamLimit: 3 but can still take >3 exams → Check browser cache')
console.log('4. Try hard refresh (Ctrl+Shift+R) to clear any cached data')
console.log('5. Try logging out and logging back in')
console.log('')
console.log('✅ EXPECTED WORKING BEHAVIOR:')
console.log('- Free users see dailyExamLimit: 3')
console.log('- Free users see "Daily Exams: X/3" in UI')
console.log('- After 3 exams, "Start Exam" button becomes "Limit Reached"')
console.log('- Trying to start 4th exam shows error message')
console.log('')
console.log('🧪 Debug complete! Check the values above and compare with expected behavior.')