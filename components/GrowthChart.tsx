import React, { useMemo } from 'react';
import { GrowthEntry } from '../types';

interface GrowthChartProps {
  history: GrowthEntry[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ history }) => {

  const chartData = useMemo(() => {
    if (!history || history.length < 2) return null;

    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dates = sortedHistory.map(h => new Date(h.date));
    const heights = sortedHistory.map(h => h.height);

    const minDate = Math.min(...dates.map(d => d.getTime()));
    const maxDate = Math.max(...dates.map(d => d.getTime()));
    const minHeight = 0; // Always start y-axis at 0
    const maxHeight = Math.max(...heights) * 1.2; // 20% headroom

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    const getX = (date: Date) => {
        if (maxDate === minDate) return padding.left; // Avoid division by zero
        return padding.left + ((date.getTime() - minDate) / (maxDate - minDate)) * (width - padding.left - padding.right);
    };

    const getY = (h: number) => {
        if (maxHeight === minHeight) return height - padding.bottom;
        return (height - padding.bottom) - ((h - minHeight) / (maxHeight - minHeight)) * (height - padding.top - padding.bottom);
    };

    const points = sortedHistory.map(h => ({
      x: getX(new Date(h.date)),
      y: getY(h.height),
      original: h,
    }));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach(p => {
        path += ` L ${p.x} ${p.y}`;
    });
    
    return {
        width,
        height,
        padding,
        points,
        path,
        minHeight,
        maxHeight,
        startDate: new Date(minDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        endDate: new Date(maxDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };

  }, [history]);
  
  if (!history || history.length < 2) {
    return (
        <div className="text-center py-10 px-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Not enough data for a chart. Add at least two growth entries to see your plant's progress.
            </p>
        </div>
    );
  }

  if (!chartData) return null;

  return (
    <div className="relative w-full">
        <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} className="w-full h-auto">
            {/* Y-axis labels */}
            <text x={chartData.padding.left - 8} y={chartData.padding.top} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">
                {Math.round(chartData.maxHeight)} cm
            </text>
            <text x={chartData.padding.left - 8} y={chartData.height - chartData.padding.bottom} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">
                {chartData.minHeight} cm
            </text>

            {/* X-axis labels */}
            <text x={chartData.padding.left} y={chartData.height - chartData.padding.bottom + 15} textAnchor="start" className="text-xs fill-current text-gray-500 dark:text-gray-400">
                {chartData.startDate}
            </text>
            <text x={chartData.width - chartData.padding.right} y={chartData.height - chartData.padding.bottom + 15} textAnchor="end" className="text-xs fill-current text-gray-500 dark:text-gray-400">
                {chartData.endDate}
            </text>

            {/* Grid lines */}
            <line x1={chartData.padding.left} y1={chartData.padding.top} x2={chartData.padding.left} y2={chartData.height - chartData.padding.bottom} className="stroke-current text-gray-200 dark:text-slate-700" strokeWidth="1" />
            <line x1={chartData.padding.left} y1={chartData.height - chartData.padding.bottom} x2={chartData.width - chartData.padding.right} y2={chartData.height - chartData.padding.bottom} className="stroke-current text-gray-200 dark:text-slate-700" strokeWidth="1" />
            
            {/* Line path */}
            <path d={chartData.path} className="stroke-current text-green-500" strokeWidth="2" fill="none" />

            {/* Data points */}
            {chartData.points.map((p, i) => (
                <g key={p.original.id} className="group">
                    <circle cx={p.x} cy={p.y} r="4" className="fill-current text-green-600" />
                     <circle cx={p.x} cy={p.y} r="8" className="fill-transparent cursor-pointer" />
                     {/* Tooltip */}
                     <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <rect x={p.x - 40} y={p.y - 45} width="80" height="35" rx="5" className="fill-current text-slate-800 dark:text-black"/>
                        <text x={p.x} y={p.y - 35} textAnchor="middle" className="text-xs fill-current text-white font-semibold">{p.original.height} cm</text>
                        <text x={p.x} y={p.y - 20} textAnchor="middle" className="text-xs fill-current text-white">{new Date(p.original.date).toLocaleDateString()}</text>
                     </g>
                </g>
            ))}
        </svg>
    </div>
  );
};
