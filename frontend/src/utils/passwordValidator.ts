/**
 * Password Validator
 * 
 * Utility for validating passwords against the password policy.
 */

import { PasswordPolicyConfig } from '../types/enhancedAuth';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a password against the password policy
 * @param password Password to validate
 * @param policy Password policy configuration
 * @param previousPasswords Optional array of previous passwords to check against
 * @returns Password validation result
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicyConfig,
  previousPasswords: string[] = []
): PasswordValidationResult {
  const errors: string[] = [];
  
  // Check length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }
  
  // Check for special characters
  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for numbers
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for password reuse
  if (policy.preventReuse > 0 && previousPasswords.length > 0) {
    // In a real implementation, we would compare hashes
    // For this implementation, we'll just compare the passwords directly
    if (previousPasswords.includes(password)) {
      errors.push(`Password cannot be the same as your previous ${policy.preventReuse} passwords`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate a password strength score
 * @param password Password to evaluate
 * @returns Score from 0 (weakest) to 100 (strongest)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Length contribution (up to 40 points)
  score += Math.min(40, password.length * 4);
  
  // Character variety contribution (up to 60 points)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
  
  if (hasLowercase) score += 10;
  if (hasUppercase) score += 15;
  if (hasNumbers) score += 15;
  if (hasSpecialChars) score += 20;
  
  // Penalize for patterns
  if (/(.)\1{2,}/.test(password)) { // Repeated characters
    score -= 10;
  }
  
  if (/^(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)$/i.test(password)) {
    // Sequential characters
    score -= 15;
  }
  
  if (/^(?:123|234|345|456|567|678|789|890)$/.test(password)) {
    // Sequential numbers
    score -= 15;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get password strength label
 * @param score Password strength score
 * @returns Strength label
 */
export function getPasswordStrengthLabel(score: number): 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong' {
  if (score < 20) return 'very weak';
  if (score < 40) return 'weak';
  if (score < 60) return 'moderate';
  if (score < 80) return 'strong';
  return 'very strong';
}
