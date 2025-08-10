import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const switchToRegister = () => setMode('register');
  const switchToLogin = () => setMode('login');

  return (
    <div className="auth-page">
      {mode === 'login' ? (
        <LoginForm onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterForm onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
};