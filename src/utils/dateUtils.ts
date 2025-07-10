/**
 * Calculate age in years and months from date of birth
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @param t - Translation function (optional)
 * @returns Formatted age string like "X years Y months old"
 */
export function calculateAgeInYearsAndMonths(dateOfBirth: string, t?: any): string {
  if (!dateOfBirth) return t ? t('age.notAvailable') : 'Age not available'
  
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    return t ? t('age.invalidDate') : 'Invalid date'
  }
  
  // Calculate the difference
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  
  // Adjust if the current month/day is before the birth month/day
  if (months < 0) {
    years--
    months += 12
  }
  
  // Further adjust if the current day is before the birth day
  if (today.getDate() < birthDate.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }
  
  // Format the output
  if (years === 0) {
    if (months === 0) {
      return t ? t('age.lessThanOneMonth') : 'Less than 1 month old'
    } else if (months === 1) {
      return t ? t('age.oneMonth') : '1 month old'
    } else {
      return t ? t('age.monthsOld', { months }) : `${months} months old`
    }
  } else if (years === 1) {
    if (months === 0) {
      return t ? t('age.oneYear') : '1 year old'
    } else if (months === 1) {
      return t ? t('age.oneYearOneMonth') : '1 year 1 month old'
    } else {
      return t ? t('age.oneYearMonths', { months }) : `1 year ${months} months old`
    }
  } else {
    if (months === 0) {
      return t ? t('age.yearsOld', { years }) : `${years} years old`
    } else if (months === 1) {
      return t ? t('age.yearsOneMonth', { years }) : `${years} years 1 month old`
    } else {
      return t ? t('age.yearsMonthsOld', { years, months }) : `${years} years ${months} months old`
    }
  }
}

/**
 * Calculate age in years only (for simple display)
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Age in years as a number
 */
export function calculateAgeInYears(dateOfBirth: string): number {
  if (!dateOfBirth) return 0
  
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  
  if (isNaN(birthDate.getTime())) {
    return 0
  }
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return Math.max(0, age)
}

/**
 * Format date for display
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  return date.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Validate if a date string is a valid date and not in the future
 * @param dateString - Date string to validate
 * @param t - Translation function (optional)
 * @returns Object with validation result and error message
 */
export function validateDateOfBirth(dateString: string, t?: any): { isValid: boolean; error?: string } {
  if (!dateString) {
    return { isValid: false, error: t ? t('validation.dateRequired') : 'Date of birth is required' }
  }
  
  const date = new Date(dateString)
  const today = new Date()
  
  if (isNaN(date.getTime())) {
    return { isValid: false, error: t ? t('validation.invalidDate') : 'Please enter a valid date' }
  }
  
  if (date > today) {
    return { isValid: false, error: t ? t('validation.futureDate') : 'Date of birth cannot be in the future' }
  }
  
  // Check if the person would be too old (over 25 years) or too young (under 3 years)
  const age = calculateAgeInYears(dateString)
  if (age > 25) {
    return { isValid: false, error: t ? t('validation.tooOld') : 'Age cannot be more than 25 years' }
  }
  
  if (age < 3) {
    return { isValid: false, error: t ? t('validation.tooYoung') : 'Age must be at least 3 years' }
  }
  
  return { isValid: true }
}