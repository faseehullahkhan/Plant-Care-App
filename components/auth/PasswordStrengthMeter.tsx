import React from 'react';

interface PasswordStrengthMeterProps {
  score: number; // 0 to 4
  label: string;
  color: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ score, label, color }) => {
  const barSegments = [1, 2, 3, 4];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2">
        {barSegments.map((segment) => (
          <div key={segment} className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-slate-700">
            <div
              className={`h-1.5 rounded-full ${score >= segment ? color : 'bg-transparent'}`}
              style={{ transition: 'background-color 0.3s ease-in-out, width 0.3s ease-in-out' }}
            />
          </div>
        ))}
      </div>
      <p className={`text-xs ${score > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
        Password strength: <span className="font-bold">{label}</span>
      </p>
    </div>
  );
};
