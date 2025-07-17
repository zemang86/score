/*
  # Add syllabus_reference column to questions table

  1. Changes
    - Add `syllabus_reference` column to questions table
    - Column is optional (nullable) for backward compatibility
    - Text type to store syllabus reference snippets
*/

-- Add syllabus_reference column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS syllabus_reference text;

-- Add comment to document the column purpose
COMMENT ON COLUMN questions.syllabus_reference IS 'Short, readable syllabus reference snippet for the question';