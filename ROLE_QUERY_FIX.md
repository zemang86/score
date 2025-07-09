# 🔧 Fix for Infinite Recursion in Role Queries

## ❌ BROKEN CODE (causing infinite recursion):
```javascript
// This is WRONG - user_roles table doesn't have user_id
const { data, error } = await supabase
  .from('user_roles')
  .select('role_type')
  .eq('user_id', userId)
```

## ✅ CORRECT CODE:
```javascript
// This is CORRECT - query client_users and join to user_roles
const { data, error } = await supabase
  .from('client_users')
  .select('role:user_roles(role_type)')
  .eq('user_id', userId)
  .single()
```

## 🎯 Final `checkAdminRole` function:
```javascript
export const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('role:user_roles(role_type)')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error checking admin role:', error)
      return false
    }

    return data?.role?.role_type === 'admin'
  } catch (error) {
    console.error('Error in checkAdminRole:', error)
    return false
  }
}
```

## 🎯 ProtectedRoute usage:
```javascript
import { checkAdminRole } from '../lib/roleHelpers'

// In your ProtectedRoute component:
const access = await checkAdminRole(user.id)
```

## 🔍 Key Changes:
1. **Query `client_users`** instead of `user_roles`
2. **Use join syntax**: `select='role:user_roles(role_type)'`
3. **Filter by `user_id`** on the `client_users` table
4. **Access role**: `data?.role?.role_type`

## 📝 Replace any instances of:
- `from('user_roles').select(...).eq('user_id', ...)`
- With: `from('client_users').select('role:user_roles(role_type)').eq('user_id', ...)`

This fixes the infinite recursion by using the correct table relationships!