/**
 * MFA Verification Component
 * 
 * Component for handling multi-factor authentication verification.
 */

import React, { useState } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';

interface MFAVerificationProps {
  onComplete?: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({ onComplete }) => {
  const { completeMfa, error, isLoading } = useEnhancedAuth();
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await completeMfa(verificationCode);
      
      if (result && onComplete) {
        onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mfa-verification">
      <h2>Two-Factor Authentication</h2>
      <p>Please enter the verification code from your authenticator app or device.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="verification-code">Verification Code</label>
          <input
            type="text"
            id="verification-code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {error && (
          <div className="error-message">
            {error.message}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !verificationCode}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      
      <div className="mfa-help">
        <p>
          <strong>Don't have your authenticator app?</strong>
        </p>
        <ul>
          <li>
            <button className="btn-link">
              Use recovery code
            </button>
          </li>
          <li>
            <button className="btn-link">
              Send code via SMS
            </button>
          </li>
          <li>
            <button className="btn-link">
              Contact support
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MFAVerification;
