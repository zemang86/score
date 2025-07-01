/*
  # Fix Age Column and Add Language Support

  1. Schema Changes
    - Remove age column from students table (calculated from date_of_birth)
    - Add language preference to users table
    - Add language support for education levels

  2. Language Support
    - Add language column to users table (default 'en' for English)
    - Create function to get localized education levels
    - Support for English and Malay languages

  3. Data Migration
    - Remove age column as it's calculated from date_of_birth
    - Set default language based on user preference
*/

-- Remove age column from students table since it's calculated from date_of_birth
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'age'
  ) THEN
    ALTER TABLE students DROP COLUMN age;
  END IF;
END $$;

-- Add language preference to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'language'
  ) THEN
    ALTER TABLE users ADD COLUMN language text DEFAULT 'en' NOT NULL;
  END IF;
END $$;

-- Add check constraint for valid languages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'users_language_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_language_check 
    CHECK (language IN ('en', 'ms'));
  END IF;
END $$;

-- Create function to get localized education levels
CREATE OR REPLACE FUNCTION get_education_levels(user_language text DEFAULT 'en')
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  IF user_language = 'ms' THEN
    RETURN jsonb_build_array(
      'Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6',
      'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'
    );
  ELSE
    RETURN jsonb_build_array(
      'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
      'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'
    );
  END IF;
END;
$$;

-- Create function to get localized subjects
CREATE OR REPLACE FUNCTION get_subjects(user_language text DEFAULT 'en')
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  IF user_language = 'ms' THEN
    RETURN jsonb_build_array(
      'Bahasa Melayu', 'Bahasa Inggeris', 'Matematik', 'Sains', 'Sejarah'
    );
  ELSE
    RETURN jsonb_build_array(
      'Malay Language', 'English', 'Mathematics', 'Science', 'History'
    );
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_education_levels(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subjects(text) TO authenticated;

-- Add index for language queries
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Update existing users to have English as default language
UPDATE users SET language = 'en' WHERE language IS NULL;