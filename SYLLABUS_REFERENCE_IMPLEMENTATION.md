# Syllabus Reference Implementation

## Overview
Added syllabus reference functionality to the exam system to display relevant syllabus information under each question during exams and in the admin interface.

## Database Changes

### Migration Required
Execute the following SQL to add the `syllabus_reference` column to the questions table:

```sql
-- Add syllabus_reference column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS syllabus_reference text;

-- Add comment to document the column purpose
COMMENT ON COLUMN questions.syllabus_reference IS 'Short, readable syllabus reference snippet for the question';
```

## Frontend Changes

### 1. TypeScript Interface Updates
- **File**: `src/lib/supabase.ts`
- **Change**: Added `syllabus_reference?: string` to the `Question` interface

### 2. Exam Modal Updates
- **File**: `src/components/dashboard/ExamModal.tsx`
- **Changes**:
  - Added syllabus reference display during exam questions
  - Added syllabus reference in the exam results/review section
  - Uses amber-colored styling with BookOpen icon for visual distinction

### 3. Admin Interface Updates

#### EditQuestionModal
- **File**: `src/components/admin/EditQuestionModal.tsx`
- **Changes**:
  - Added `syllabus_reference` field to `QuestionFormData` interface
  - Added form input field for syllabus reference
  - Updated form data population and saving logic
  - Added placeholder text and helper text for user guidance

#### QuestionManagement
- **File**: `src/components/admin/QuestionManagement.tsx`
- **Changes**:
  - Added syllabus reference display in question list
  - Shows with BookOpen icon and amber styling
  - Displays alongside existing topic and image indicators

## UI/UX Features

### During Exam
- Syllabus reference appears in a subtle amber box below the question text
- Uses BookOpen icon for visual identification
- Only displays when syllabus_reference is not empty
- Maintains clean, readable design that doesn't distract from the question

### In Admin Interface
- Easy-to-use input field with placeholder example
- Helper text explains the purpose
- Optional field for backward compatibility
- Displays in question list for quick reference

### In Results/Review
- Shows syllabus reference in compact format
- Helps students understand which topic areas they need to review
- Consistent styling with the exam interface

## Technical Implementation

### Database Schema
```sql
ALTER TABLE questions 
ADD COLUMN syllabus_reference text;
```

### TypeScript Interface
```typescript
export interface Question {
  // ... existing fields
  syllabus_reference?: string
}
```

### React Component Updates
- Conditional rendering based on field presence
- Consistent styling across all components
- Responsive design for mobile and desktop

## Benefits

1. **Better Learning Context**: Students can immediately see which syllabus section a question relates to
2. **Improved Study Planning**: Students know exactly what to review based on incorrect answers
3. **Teacher Efficiency**: Easy to add and manage syllabus references through admin interface
4. **Backward Compatibility**: Existing questions without syllabus references continue to work normally

## Usage Instructions

### For Administrators
1. Open the Question Management interface
2. Edit any question or create a new one
3. Fill in the "Syllabus Reference" field with a short, readable reference
4. Examples:
   - "Chapter 5: Fractions (5.1.2)"
   - "Unit 3: Photosynthesis"
   - "Topic 2.1: Number Operations"

### For Students
- During exams, look for the amber-colored box below questions
- This shows which syllabus section the question covers
- Use this information to guide your study after the exam

## Files Modified
1. `supabase/migrations/20250107000000_add_syllabus_reference.sql` (new)
2. `src/lib/supabase.ts`
3. `src/components/dashboard/ExamModal.tsx`
4. `src/components/admin/EditQuestionModal.tsx`
5. `src/components/admin/QuestionManagement.tsx`

## Next Steps
1. Apply the database migration
2. Test the functionality in both admin and student interfaces
3. Add syllabus references to existing questions as needed
4. Consider adding bulk import/export functionality for syllabus references