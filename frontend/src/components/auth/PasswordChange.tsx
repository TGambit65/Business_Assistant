/**
 * Password Change Component
 * 
 * Component for changing passwords with policy enforcement.
 */

import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { 
  validatePassword, 
  calculatePasswordStrength, 
  getPasswordStrengthLabel 
} from '../../utils/passwordValidator';
import { getAuthConfig } from '../../config/authConfig';

const PasswordChange: React.FC = () => {
  const { error } = useEnhancedAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Get password policy from config
  const passwordPolicy = getAuthConfig().passwordPolicyConfig;
  
  // Update password strength when password changes
  useEffect(() => {
    if (newPassword) {
      const strength = calculatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);
  
  // Validate password against policy
  const validateNewPassword = () => {
    if (!newPassword) {
      setValidationErrors(['Please enter a new password']);
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationErrors(['Passwords do not match']);
      return false;
    }
    
    // Validate against password policy
    const result = validatePassword(newPassword, passwordPolicy);
    
    if (!result.valid) {
      setValidationErrors(result.errors);
      return false;
    }
    
    setValidationErrors([]);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    
    // Validate password
    if (!validateNewPassword()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to change the password
      // For now, we'll just simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage('Password changed successfully');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get password strength class
  const getStrengthClass = () => {
    if (passwordStrength < 20) return 'strength-very-weak';
    if (passwordStrength < 40) return 'strength-weak';
    if (passwordStrength < 60) return 'strength-moderate';
    if (passwordStrength < 80) return 'strength-strong';
    return 'strength-very-strong';
  };
  
  return (
    <div className="password-change">
      <h2>Change Password</h2>
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      
      {error && (
        <div className="alert alert-danger">{error.message}</div>
      )}
      
      {validationErrors.length > 0 && (
        <div className="alert alert-warning">
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          
          {newPassword && (
            <div className="password-strength">
              <div className="strength-bar-container">
                <div 
                  className={`strength-bar ${getStrengthClass()}`}
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>
              <div className="strength-label">
                Password strength: {getPasswordStrengthLabel(passwordStrength)}
              </div>
            </div>
          )}
          
          <div className="password-requirements">
            <p>Password requirements:</p>
            <ul>
              <li className={newPassword.length >= passwordPolicy.minLength ? 'met' : 'not-met'}>
                At least {passwordPolicy.minLength} characters
              </li>
              {passwordPolicy.requireSpecialChars && (
                <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(newPassword) ? 'met' : 'not-met'}>
                  At least one special character
                </li>
              )}
              {passwordPolicy.requireNumbers && (
                <li className={/\d/.test(newPassword) ? 'met' : 'not-met'}>
                  At least one number
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordChange;
