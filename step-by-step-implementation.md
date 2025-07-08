# Step-by-Step Implementation Guide

## Phase 1: Database Schema Update

### Step 1.1: Create Migration File

Create a new migration file: `supabase/migrations/[timestamp]_add_beta_tester_support.sql`

```sql
/*
  # Add Beta Tester Support

  1. Changes
    - Add `beta_tester` column to users table
    - Create index for performance
    - Create view for effective access levels
    - Add helper functions for beta management

  2. Security
    - Maintain existing RLS policies
    - Add policies for beta tester management
*/

-- Add beta_tester column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS beta_tester boolean DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_beta_tester ON users(beta_tester);

-- Create view for enhanced user access information
CREATE OR REPLACE VIEW user_access_details AS
SELECT 
  u.*,
  CASE 
    WHEN u.beta_tester = true THEN 'beta_tester'
    ELSE u.subscription_plan
  END as effective_access_level,
  CASE 
    WHEN u.beta_tester = true THEN 999999  -- Unlimited students for beta
    ELSE u.max_students
  END as effective_max_students,
  CASE 
    WHEN u.beta_tester = true THEN 999     -- Unlimited exams for beta
    ELSE u.daily_exam_limit
  END as effective_daily_exam_limit,
  CASE 
    WHEN u.beta_tester = true THEN true
    WHEN u.subscription_plan = 'premium' THEN true
    ELSE false
  END as has_unlimited_access
FROM users u;

-- Grant access to the view
GRANT SELECT ON user_access_details TO authenticated;

-- Create helper functions for beta tester management
CREATE OR REPLACE FUNCTION make_user_beta_tester(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users SET beta_tester = true WHERE id = user_id;
  SELECT true;
$$;

CREATE OR REPLACE FUNCTION remove_user_beta_tester(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users SET beta_tester = false WHERE id = user_id;
  SELECT true;
$$;

-- Update can_add_student function to consider beta testers
CREATE OR REPLACE FUNCTION can_add_student(user_id uuid)
RETURNS boolean AS $$
DECLARE
  student_count integer;
  max_students integer;
  is_beta_tester boolean;
BEGIN
  -- Get student count
  SELECT COUNT(*) INTO student_count
  FROM students
  WHERE user_id = $1;
  
  -- Get user limits and beta status
  SELECT u.max_students, u.beta_tester INTO max_students, is_beta_tester
  FROM users u
  WHERE u.id = $1;
  
  -- Beta testers have unlimited students
  IF is_beta_tester THEN
    RETURN true;
  END IF;
  
  RETURN student_count < max_students;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update can_take_exam function to consider beta testers
CREATE OR REPLACE FUNCTION can_take_exam(student_id uuid)
RETURNS boolean AS $$
DECLARE
  daily_limit integer;
  daily_count integer;
  user_id uuid;
  is_beta_tester boolean;
BEGIN
  -- Get the user_id for this student
  SELECT s.user_id INTO user_id
  FROM students s
  WHERE s.id = student_id;
  
  -- Get the daily exam limit and beta status for this user
  SELECT u.daily_exam_limit, u.beta_tester INTO daily_limit, is_beta_tester
  FROM users u
  WHERE u.id = user_id;
  
  -- Beta testers have unlimited exams
  IF is_beta_tester THEN
    RETURN true;
  END IF;
  
  -- If unlimited (999), return true
  IF daily_limit = 999 THEN
    RETURN true;
  END IF;
  
  -- Count today's exams
  SELECT COUNT(*) INTO daily_count
  FROM exams e
  WHERE e.student_id = student_id
    AND DATE(e.created_at) = CURRENT_DATE
    AND e.completed = true;
  
  RETURN daily_count < daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Phase 2: Backend Logic Updates

### Step 2.1: Update User Types

Update `src/lib/supabase.ts`:

```typescript
// Update User interface
export interface User {
  id: string
  email: string
  full_name: string
  subscription_plan: 'free' | 'premium'
  max_students: number
  daily_exam_limit: number
  beta_tester: boolean  // Add this line
  created_at: string
  updated_at: string
}

export interface UserWithAdminStatus extends User {
  isAdmin: boolean
}

// Add new types for access levels
export type AccessLevel = 'free' | 'premium' | 'beta_tester' | 'admin'

export interface EffectiveAccess {
  level: AccessLevel
  maxStudents: number
  dailyExamLimit: number
  hasUnlimitedAccess: boolean
}

// Add helper functions
export const getUserAccessLevel = (user: UserWithAdminStatus): AccessLevel => {
  if (user.isAdmin) return 'admin'
  if (user.beta_tester) return 'beta_tester'
  return user.subscription_plan
}

export const getEffectiveAccess = (user: UserWithAdminStatus): EffectiveAccess => {
  if (user.beta_tester) {
    return {
      level: 'beta_tester',
      maxStudents: 999999,
      dailyExamLimit: 999,
      hasUnlimitedAccess: true
    }
  }
  
  return {
    level: user.subscription_plan,
    maxStudents: user.max_students,
    dailyExamLimit: user.daily_exam_limit,
    hasUnlimitedAccess: user.subscription_plan === 'premium'
  }
}

// Add beta tester management functions
export const makeBetaTester = async (userId: string): Promise<{success: boolean, error?: string}> => {
  console.log('🧪 makeBetaTester: Making user beta tester:', userId)
  
  if (!userId) {
    return { success: false, error: 'No userId provided' }
  }
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ beta_tester: true })
      .eq('id', userId)
    
    if (error) {
      console.error('❌ makeBetaTester: Error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ makeBetaTester: User successfully made beta tester')
    return { success: true }
  } catch (error: any) {
    console.error('❌ makeBetaTester: Unexpected error:', error)
    return { success: false, error: error.message }
  }
}

export const removeBetaTester = async (userId: string): Promise<{success: boolean, error?: string}> => {
  console.log('🧪 removeBetaTester: Removing beta tester status from user:', userId)
  
  if (!userId) {
    return { success: false, error: 'No userId provided' }
  }
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ beta_tester: false })
      .eq('id', userId)
    
    if (error) {
      console.error('❌ removeBetaTester: Error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ removeBetaTester: Beta tester status successfully removed')
    return { success: true }
  } catch (error: any) {
    console.error('❌ removeBetaTester: Unexpected error:', error)
    return { success: false, error: error.message }
  }
}
```

### Step 2.2: Update AuthContext

Update `src/contexts/AuthContext.tsx`:

```typescript
// Add to AuthContextType interface
interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserWithAdminStatus | null
  subscriptionPlan: 'free' | 'premium' | null
  maxStudents: number
  dailyExamLimit: number
  isAdmin: boolean
  isBetaTester: boolean  // Add this line
  effectiveAccess: EffectiveAccess  // Add this line
  loading: boolean
  profileLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  refreshUserProfile: () => Promise<void>
}

// Add state variables in AuthProvider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... existing state ...
  const [isBetaTester, setIsBetaTester] = useState<boolean>(false)
  const [effectiveAccess, setEffectiveAccess] = useState<EffectiveAccess>({
    level: 'free',
    maxStudents: 1,
    dailyExamLimit: 3,
    hasUnlimitedAccess: false
  })

  // Update getUserProfile function to handle beta tester
  const getUserProfile = async (userId: string): Promise<void> => {
    // ... existing code ...
    
    if (userProfile) {
      setProfile(userProfile)
      setSubscriptionPlan(userProfile.subscription_plan)
      setMaxStudents(userProfile.max_students)
      setDailyExamLimit(userProfile.daily_exam_limit)
      setIsAdmin(userProfile.isAdmin)
      setIsBetaTester(userProfile.beta_tester)  // Add this line
      
      // Calculate effective access
      const access = getEffectiveAccess(userProfile)
      setEffectiveAccess(access)
    } else {
      // ... existing reset code ...
      setIsBetaTester(false)  // Add this line
      setEffectiveAccess({
        level: 'free',
        maxStudents: 1,
        dailyExamLimit: 3,
        hasUnlimitedAccess: false
      })
    }
  }

  // Update signUp function to include beta_tester
  const signUp = async (email: string, password: string, fullName: string) => {
    // ... existing code ...
    
    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            subscription_plan: 'free',
            max_students: 1,
            daily_exam_limit: 3,
            beta_tester: false,  // Add this line
          },
        ])
      
      // ... rest of existing code ...
    }
  }

  // Update value object
  const value = useMemo(() => ({
    user,
    session,
    profile,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    isBetaTester,  // Add this line
    effectiveAccess,  // Add this line
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  }), [
    // ... existing dependencies ...
    isBetaTester,  // Add this line
    effectiveAccess,  // Add this line
  ])

  // ... rest of component
}
```

## Phase 3: Admin Interface Updates

### Step 3.1: Update UserManagement Component

Update `src/components/admin/UserManagement.tsx`:

```typescript
// Add to UserData interface
interface UserData {
  id: string
  email: string
  full_name: string
  subscription_plan: 'free' | 'premium'
  max_students: number
  daily_exam_limit: number
  beta_tester: boolean  // Add this line
  created_at: string
  updated_at: string
  student_count?: number
  last_login?: string
  current_student_count?: number
}

// Update the getPlanBadge function
const getAccessBadge = (user: UserData) => {
  if (user.beta_tester) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        <Zap className="w-3 h-3 mr-1" />
        Beta Tester
      </span>
    )
  }
  if (user.subscription_plan === 'premium') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
      <User className="w-3 h-3 mr-1" />
      Free
    </span>
  )
}

// Update the user display logic in the table
<div className="text-xs text-gray-600">
  <div className="flex items-center">
    <Users className="w-3 h-3 mr-1" />
    <span>
      {user.beta_tester 
        ? `${user.current_student_count || 0} kids (unlimited - beta)`
        : user.subscription_plan === 'free' 
          ? `${user.current_student_count || 0} of 1 kids` 
          : `${user.current_student_count || 0} kids (${user.max_students || 1} purchased)`}
    </span>
  </div>
  <div className="flex items-center mt-1">
    <BookOpen className="w-3 h-3 mr-1" />
    <span>
      {user.beta_tester 
        ? 'Unlimited exams/day (beta)'
        : user.subscription_plan === 'free' 
          ? '3 exams/day' 
          : `${user.daily_exam_limit === 999 ? '∞' : user.daily_exam_limit} exams/day`}
    </span>
  </div>
</div>

// Update the badge display
<div className="mt-1">
  {getAccessBadge(user)}
</div>
```

### Step 3.2: Update EditUserModal Component

Update `src/components/admin/EditUserModal.tsx`:

```typescript
// Add to UserFormData interface
interface UserFormData {
  full_name: string
  email: string
  subscription_plan: 'free' | 'premium'
  max_students: number
  daily_exam_limit: number
  beta_tester: boolean  // Add this line
}

// Update initial state
const [formData, setFormData] = useState<UserFormData>({
  full_name: '',
  email: '',
  subscription_plan: 'free',
  max_students: 0,
  daily_exam_limit: 0,
  beta_tester: false,  // Add this line
})

// Update fetchUserData function
const fetchUserData = async () => {
  // ... existing code ...
  
  setFormData({
    full_name: userData.full_name || '',
    email: userData.email || '',
    subscription_plan: userData.subscription_plan || 'free',
    max_students: userData.max_students || 0,
    daily_exam_limit: userData.daily_exam_limit || 0,
    beta_tester: userData.beta_tester || false,  // Add this line
  })
}

// Update handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing validation ...
  
  const { error: updateError } = await supabase
    .from('users')
    .update({
      full_name: formData.full_name,
      subscription_plan: formData.subscription_plan,
      max_students: formData.max_students,
      daily_exam_limit: formData.daily_exam_limit,
      beta_tester: formData.beta_tester,  // Add this line
    })
    .eq('id', userId)
  
  // ... rest of existing code ...
}

// Add beta tester toggle in the form (after subscription plan section)
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Beta Tester Access
  </label>
  <div className="flex items-center space-x-3">
    <button
      type="button"
      onClick={() => handleInputChange('beta_tester', !formData.beta_tester)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        formData.beta_tester ? 'bg-purple-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          formData.beta_tester ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
    <span className={`text-sm font-medium ${formData.beta_tester ? 'text-purple-700' : 'text-gray-700'}`}>
      {formData.beta_tester ? 'Beta Tester Enabled' : 'Regular User'}
    </span>
  </div>
  {formData.beta_tester && (
    <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center">
        <Zap className="w-4 h-4 text-purple-600 mr-2" />
        <span className="text-sm font-medium text-purple-700">Beta Tester Benefits</span>
      </div>
      <ul className="mt-1 text-xs text-purple-600 space-y-1">
        <li>• Unlimited students</li>
        <li>• Unlimited daily exams</li>
        <li>• Access to all premium features</li>
        <li>• Early access to new features</li>
      </ul>
    </div>
  )}
  <p className="text-xs text-gray-500 mt-1">
    Beta testers get unlimited access to all features regardless of subscription plan.
  </p>
</div>
```

## Phase 4: Feature Gate Updates

### Step 4.1: Create Access Control Utility

Create `src/utils/accessControl.ts`:

```typescript
import { UserWithAdminStatus, AccessLevel, EffectiveAccess } from '../lib/supabase'

export const getUserAccessLevel = (user: UserWithAdminStatus): AccessLevel => {
  if (user.isAdmin) return 'admin'
  if (user.beta_tester) return 'beta_tester'
  return user.subscription_plan
}

export const getEffectiveAccess = (user: UserWithAdminStatus): EffectiveAccess => {
  if (user.beta_tester) {
    return {
      level: 'beta_tester',
      maxStudents: 999999,
      dailyExamLimit: 999,
      hasUnlimitedAccess: true
    }
  }
  
  return {
    level: user.subscription_plan,
    maxStudents: user.max_students,
    dailyExamLimit: user.daily_exam_limit,
    hasUnlimitedAccess: user.subscription_plan === 'premium'
  }
}

export const canAddStudent = (user: UserWithAdminStatus, currentStudentCount: number): boolean => {
  if (user.beta_tester || user.isAdmin) return true
  return currentStudentCount < user.max_students
}

export const canTakeExam = (user: UserWithAdminStatus, dailyExamCount: number): boolean => {
  if (user.beta_tester || user.isAdmin) return true
  if (user.daily_exam_limit === 999) return true
  return dailyExamCount < user.daily_exam_limit
}

export const hasFeatureAccess = (user: UserWithAdminStatus, feature: string): boolean => {
  if (user.isAdmin || user.beta_tester) return true
  
  // Define feature access based on subscription
  const premiumFeatures = ['unlimited_exams', 'advanced_analytics', 'priority_support']
  
  if (premiumFeatures.includes(feature)) {
    return user.subscription_plan === 'premium'
  }
  
  return true // Default to allowing free features
}

export const getAccessBadgeProps = (user: UserWithAdminStatus) => {
  if (user.beta_tester) {
    return {
      text: 'Beta Tester',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: 'Zap'
    }
  }
  if (user.subscription_plan === 'premium') {
    return {
      text: 'Premium',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: 'Crown'
    }
  }
  return {
    text: 'Free',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'User'
  }
}
```

### Step 4.2: Update Feature Gates Throughout App

Example for a component that checks student limits:

```typescript
// Before
const canAddStudent = currentStudentCount < maxStudents

// After
import { canAddStudent } from '../utils/accessControl'
const canAddNewStudent = canAddStudent(profile, currentStudentCount)
```

Example for exam limits:

```typescript
// Before
const canTakeExam = dailyExamCount < dailyExamLimit

// After
import { canTakeExam } from '../utils/accessControl'
const canTakeNewExam = canTakeExam(profile, dailyExamCount)
```

## Phase 5: Testing

### Step 5.1: Test the Migration

```bash
# Apply the migration
npx supabase db push

# Test the functions
psql -h localhost -p 54322 -d postgres -U postgres -c "
SELECT make_user_beta_tester('user-id-here');
SELECT * FROM user_access_details WHERE id = 'user-id-here';
SELECT remove_user_beta_tester('user-id-here');
"
```

### Step 5.2: Test Access Control

Create test cases for:
- Free user with beta tester flag
- Premium user with beta tester flag
- Admin user with beta tester flag
- Regular users without beta access

## Summary

This implementation:
1. ✅ Preserves all existing functionality
2. ✅ Adds beta tester support without breaking changes
3. ✅ Provides admin control over beta status
4. ✅ Gives beta testers unlimited access to all features
5. ✅ Maintains clear separation of concerns
6. ✅ Is easily reversible if needed

The beta tester flag acts as an override that grants unlimited access while preserving the underlying subscription system for billing and future transitions.