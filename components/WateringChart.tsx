import React, { useMemo } from 'react';

interface WateringChartProps {
  history: string[];
  idealFrequency: number;
}

export const WateringChart: React.FC<WateringChartProps> = ({ history, idealFrequency }) => {
  const { data, maxDays } = useMemo(() => {
    if (!history || history.length < 2) return { data: [], maxDays: idealFrequency };

    // History is newest to oldest from props, reverse for chronological order
    const chronologicalHistory = [...history].reverse();

    const chartData = [];
    // Start from the second item to calculate interval from the previous one
    for (let i = 1; i < chronologicalHistory.length; i++) {
      const dateCurrent = new Date(chronologicalHistory[i]);
      const datePrevious = new Date(chronologicalHistory[i - 1]);
      
      const diffTime = Math.abs(dateCurrent.getTime() - datePrevious.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      chartData.push({
        // Label the bar with the date it was watered
        date: dateCurrent.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        days: diffDays,
      });
    }

    // Determine the max value for scaling the chart, ensuring ideal frequency line is visible
    const maxDataValue = Math.max(...chartData.map(d => d.days), 0);
    const overallMax = Math.max(maxDataValue, idealFrequency) * 1.2; // Add 20% headroom

    return { data: chartData.slice(-8), maxDays: overallMax }; // Show last 8 intervals
  }, [history, idealFrequency]);

  const idealLinePosition = (idealFrequency / maxDays) * 100;

  return (
    <div className="relative w-full h-32 px-2 pt-4 pb-8 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
      {/* Ideal Frequency Line */}
      {idealLinePosition <= 100 && (
        <>
            <div
            className="absolute left-0 w-full border-t-2 border-dashed border-green-500 dark:border-green-400 opacity-70 z-10"
            style={{ bottom: `calc(${idealLinePosition}% + 2rem)` }} // 2rem is pb-8
            />
            <div 
            className="absolute left-2 text-xs text-green-600 dark:text-green-400 font-semibold z-10"
            style={{ bottom: `calc(${idealLinePosition}% + 2.1rem)` }}
            >
                Ideal: {idealFrequency} days
            </div>
        </>
      )}

      {/* Bars */}
      <div className="flex justify-around items-end w-full h-full gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
             <div className="absolute -top-6 mb-2 hidden group-hover:block bg-slate-700 text-white text-xs rounded py-1 px-2 z-20 whitespace-nowrap">
                {item.days} days
             </div>
            <div
              className="w-full bg-cyan-400 dark:bg-cyan-500 rounded-t-sm transition-all duration-300 hover:bg-cyan-500 dark:hover:bg-cyan-400"
              style={{ height: `${(item.days / maxDays) * 100}%` }}
              title={`Interval: ${item.days} days`}
            />
            <span className="absolute bottom-0 text-xs text-gray-500 dark:text-gray-400">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
