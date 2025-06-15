import { useEffect, useState } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    // Number check
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setStrength(score);

    if (password.length === 0) {
      setMessage('');
    } else if (score < 3) {
      setMessage('Weak - Add: ' + feedback.join(', '));
    } else if (score < 5) {
      setMessage('Medium - Add: ' + feedback.join(', '));
    } else {
      setMessage('Strong password!');
    }
  }, [password]);

  const getColor = () => {
    if (strength < 3) return 'bg-red-500';
    if (strength < 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (password.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <p className={`text-sm mt-1 ${
        strength < 3 ? 'text-red-500' :
        strength < 5 ? 'text-yellow-500' :
        'text-green-500'
      }`}>
        {message}
      </p>
    </div>
  );
} 