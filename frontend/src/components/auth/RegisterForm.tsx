import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string 
  }>({});
  
  const { register, loading } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: { 
      email?: string; 
      password?: string; 
      confirmPassword?: string 
    } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});
    await register({ 
      email: email.trim(), 
      password, 
      confirmPassword 
    });
  };

  const handleGoogleSignup = async () => {
    // This would redirect to Google OAuth in a real implementation
    console.log('Google OAuth signup initiated');
    // For now, we'll just log this - OAuth implementation would be added later
  };

  const handleAppleSignup = async () => {
    // This would redirect to Apple OAuth in a real implementation
    console.log('Apple OAuth signup initiated');
    // For now, we'll just log this - OAuth implementation would be added later
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-form-title">Create your CupTrack account</h2>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`form-input ${errors.password ? 'form-input-error' : ''}`}
            placeholder="Create a password"
            disabled={loading}
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
          <small className="form-hint">
            Must be 8+ characters with uppercase, lowercase, and number
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
            placeholder="Confirm your password"
            disabled={loading}
          />
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        <button 
          type="submit" 
          className="auth-button auth-button-primary"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="auth-button auth-button-google"
          disabled={loading}
        >
          <svg className="auth-button-icon" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <button
          type="button"
          onClick={handleAppleSignup}
          className="auth-button auth-button-apple"
          disabled={loading}
        >
          <svg className="auth-button-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Sign up with Apple
        </button>

        {onSwitchToLogin && (
          <p className="auth-switch">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-link"
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        )}

        <p className="auth-terms">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="auth-link">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="auth-link">Privacy Policy</a>
        </p>
      </form>
    </div>
  );
};