/*
  # Create get_user_role function

  1. New Functions
    - `get_user_role(user_id uuid)` - Returns the role of a user
      - Takes a user_id parameter
      - Returns the user's role as text
      - Handles cases where user doesn't exist
      - Provides fallback to 'parent' role

  2. Security
    - Function is accessible to authenticated users
    - Uses SECURITY DEFINER to ensure proper access
*/

-- Create the get_user_role function
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the user's role from the users table
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;
  
  -- If no role found, return 'parent' as default
  IF user_role IS NULL THEN
    RETURN 'parent';
  END IF;
  
  RETURN user_role;
EXCEPTION
  WHEN OTHERS THEN
    -- On any error, return 'parent' as safe default
    RETURN 'parent';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;