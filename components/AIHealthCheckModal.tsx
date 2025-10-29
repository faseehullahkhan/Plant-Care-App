import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HeartbeatIcon, XIcon, LoaderIcon, CheckIcon, WarningIcon, ClipboardCopyIcon, ShareIcon, DownloadIcon, SparklesIcon } from './Icons';
import { AiHealthReport, Plant } from '../types';
import { generateReportImage } from '../../utils/imageGenerator';

interface AIHealthCheckModalProps {
  plant: Plant;
  reportData: AiHealthReport | null;
  isLoading: boolean;
  onClose: () => void;
  error: string | null;
  onUpdateNotes: (plantId: string, notes: string) => void;
  imagePreviewUrl: string | null;
}

const HealthScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    // radius = (viewbox_size - stroke_width) / 2 = (120 - 12) / 2 = 54
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s < 40) return 'text-red-500';
        if (s < 70) return 'text-yellow-500';
        return 'text-green-500';
    };

    const colorClass = getColor(score);

    return (
        <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                    className="text-gray-200 dark:text-slate-700"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                {/* Progress circle */}
                <circle
                    className={colorClass}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${colorClass}`}>
                <span className="text-4xl font-bold tracking-tight">{score}</span>
                <span className="text-sm font-medium -mt-1">Health Score</span>
            </div>
        </div>
    );
};

const ReportCard: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode;}> = ({title, icon, children}) => (
    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-3 text-lg">
            {icon}
            {title}
        </h4>
        {children}
    </div>
);

const loadingMessages = [
    "Analyzing leaf color and texture...",
    "Checking for signs of pests or disease...",
    "Assessing posture and signs of stress...",
    "Compiling your personalized report...",
];

export const AIHealthCheckModal: React.FC<AIHealthCheckModalProps> = ({ plant, reportData, isLoading, onClose, error, onUpdateNotes, imagePreviewUrl }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [highlightedIssueIndex, setHighlightedIssueIndex] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const isWebShareSupported = useMemo(() => {
    return typeof navigator.share === 'function';
  }, []);

  useEffect(() => {
    if (isLoading) {
        const interval = setInterval(() => {
            setCurrentLoadingMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleCopyToNotes = () => {
    if (!reportData || !reportData.isMatch) return;
    
    const formattedDate = new Date().toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    let reportText = `AI Health Check (${formattedDate}):\n`;
    reportText += `- Score: ${reportData.healthScore}/100\n`;
    reportText += `- Assessment: ${reportData.overallAssessment}\n`;

    if (reportData.positiveSigns?.length > 0) {
        reportText += `\nWhat's Going Well:\n`;
        reportText += reportData.positiveSigns.map(s => `• ${s}`).join('\n');
    }

    if (reportData.potentialIssues?.length > 0) {
        reportText += `\n\nPotential Issues:\n`;
        reportText += reportData.potentialIssues.map(i => `• ${i.issue}: ${i.possibleCause}`).join('\n');
    }

    if (reportData.recommendations?.length > 0) {
         reportText += `\n\nRecommendations:\n`;
         reportText += reportData.recommendations.map(r => `• ${r}`).join('\n');
    }

    const newNotes = `${reportText}\n\n${plant.notes || ''}`.trim();

    onUpdateNotes(plant.id, newNotes);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5s
  };

  const handleShareOrDownload = async () => {
    if (!reportData || !reportData.isMatch) return;
    setIsSharing(true);
    try {
      const dataUrl = await generateReportImage(plant, reportData);

      if (isWebShareSupported) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${plant.name.toLowerCase().replace(/ /g, '_')}_report.png`, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Health Report for ${plant.name}`,
            text: `Here's the latest health report for my ${plant.name}.`,
          });
        } else {
          // Fallback for browsers that support share but not file sharing
          await navigator.share({ title: `Health Report for ${plant.name}`, url: dataUrl });
        }
      } else {
        // Fallback for browsers without Web Share API (trigger download)
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${plant.name.toLowerCase().replace(/ /g, '_')}_report.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Sharing or downloading failed:', err);
      // Silently fail is okay for sharing, as user might have just cancelled.
    } finally {
      setIsSharing(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
            {imagePreviewUrl && (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden shadow-lg">
                    <img src={imagePreviewUrl} alt="Analyzing plant" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <LoaderIcon className="w-12 h-12 text-white animate-spin"/>
                    </div>
                </div>
            )}
            <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-100">Our AI is on the job!</h3>
            <p className="text-gray-600 dark:text-gray-400 transition-opacity duration-500">{currentLoadingMessage}</p>
        </div>
      );
    }
    
    if (error) {
        return (
            <div className="text-center w-full space-y-4">
                <WarningIcon className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Analysis Failed</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{error}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Please try again with a clear, well-lit photo of your plant.</p>
            </div>
        );
    }
    
    if (reportData) {
        if (reportData.isMatch === false) {
             return (
                <div className="text-center w-full space-y-4">
                    <WarningIcon className="w-12 h-12 text-yellow-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Is this the right plant?</h3>
                    {imagePreviewUrl && <img src={imagePreviewUrl} alt="Uploaded plant" className="rounded-lg shadow-md w-48 h-48 object-cover mx-auto" />}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">{reportData.mismatchMessage}</p>
                </div>
            );
        }

        if (reportData.isMatch === true && reportData.healthScore !== undefined && reportData.overallAssessment) {
             return (
              <div className="w-full space-y-6">
                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {imagePreviewUrl && (
                        <div className="relative">
                            <img ref={imageRef} src={imagePreviewUrl} alt={plant.name} className="rounded-lg shadow-md w-full h-auto" />
                            {reportData.potentialIssues?.map((issue, index) => {
                                if (!issue.boundingBox) return null;
                                const { x1, y1, x2, y2 } = issue.boundingBox;
                                const isHighlighted = highlightedIssueIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={`absolute border-2 rounded-sm transition-all duration-300 pointer-events-none ${isHighlighted ? 'bg-red-500/40 border-red-400 shadow-lg' : 'bg-red-500/20 border-red-500'}`}
                                        style={{
                                            left: `${x1 * 100}%`,
                                            top: `${y1 * 100}%`,
                                            width: `${(x2 - x1) * 100}%`,
                                            height: `${(y2 - y1) * 100}%`,
                                            boxShadow: isHighlighted ? '0 0 15px rgba(239, 68, 68, 0.8)' : 'none',
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                    <div className="flex flex-col items-center text-center md:items-start md:text-left">
                        <HealthScoreGauge score={reportData.healthScore} />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4">Overall Assessment</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{reportData.overallAssessment}</p>
                    </div>
                </div>
                
                {/* Details Section */}
                <div className="space-y-4">
                    {reportData.recommendations?.length > 0 && (
                         <ReportCard title="Care Recommendations" icon={<SparklesIcon className="w-6 h-6 text-purple-500"/>}>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                               {reportData.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ol>
                        </ReportCard>
                    )}

                    {reportData.potentialIssues?.length > 0 && (
                        <ReportCard title="Potential Issues to Watch" icon={<WarningIcon className="w-6 h-6 text-yellow-500"/>}>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                {reportData.potentialIssues.map((item, i) => (
                                    <li
                                        key={i}
                                        onMouseEnter={() => setHighlightedIssueIndex(i)}
                                        onMouseLeave={() => setHighlightedIssueIndex(null)}
                                        className="p-2 rounded-md transition-colors duration-200 cursor-pointer"
                                        style={{ backgroundColor: highlightedIssueIndex === i ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}
                                    >
                                        <strong className="font-medium text-gray-800 dark:text-gray-300">{item.issue}:</strong> {item.possibleCause}
                                    </li>
                                ))}
                            </ul>
                        </ReportCard>
                    )}

                    {reportData.positiveSigns?.length > 0 && (
                        <ReportCard title="What's Going Well" icon={<CheckIcon className="w-6 h-6 text-green-500"/>}>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                {reportData.positiveSigns.map((sign, i) => <li key={i}>{sign}</li>)}
                            </ul>
                        </ReportCard>
                    )}
                </div>

              </div>
            );
        }
    }
    
    return <p className="text-gray-500 dark:text-gray-400">Could not retrieve health report.</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <HeartbeatIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-100">AI Health Check for {plant.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
          {renderContent()}
        </div>
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex flex-wrap justify-end gap-3 flex-shrink-0">
            {!isLoading && !error && reportData && reportData.isMatch && (
              <>
                <button
                    onClick={handleCopyToNotes}
                    disabled={isCopied || isSharing}
                    className={`px-4 py-2 flex items-center gap-2 border rounded-lg transition-colors duration-300 ${isCopied 
                    ? 'bg-green-100 dark:bg-green-900/50 border-green-600 text-green-700 dark:text-green-300' 
                    : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'}`}
                >
                    {isCopied ? <CheckIcon className="w-5 h-5"/> : <ClipboardCopyIcon className="w-5 h-5"/>}
                    {isCopied ? 'Copied!' : 'Copy to Notes'}
                </button>
                 <button
                    onClick={handleShareOrDownload}
                    disabled={isSharing}
                    className="px-4 py-2 flex items-center gap-2 border rounded-lg transition-colors duration-300 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                    {isSharing ? <LoaderIcon className="w-5 h-5 animate-spin" /> : (isWebShareSupported ? <ShareIcon className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />) }
                    {isSharing ? 'Generating...' : (isWebShareSupported ? 'Share Report' : 'Download Report')}
                </button>
              </>
            )}
             <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};