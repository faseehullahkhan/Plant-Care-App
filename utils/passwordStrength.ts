export interface PasswordStrength {
  score: number; // 0 to 4
  label: string;
  color: string;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  
  if (!password || password.length < 8) {
    return { score: 0, label: 'Too short', color: 'bg-gray-300 dark:bg-slate-600' };
  }
  
  // Award points for different character types
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Add a point for length to make it a bit easier to get a higher score
  if(password.length >= 12) score++;


  // Score clamping, just in case, though it should be 0-4
  score = Math.max(1, Math.min(score, 4));

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500' };
    case 2:
      return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
    case 3:
      return { score: 3, label: 'Strong', color: 'bg-green-500' };
    case 4:
      return { score: 4, label: 'Very Strong', color: 'bg-green-700' };
    default:
      // This case should not be reached if length check is done first
      return { score: 0, label: 'Too short', color: 'bg-gray-300 dark:bg-slate-600' };
  }
};
