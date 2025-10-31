import React, { useRef, useEffect, useState } from 'react';
import { CheckIcon, XIcon, RefreshIcon, WarningIcon } from './Icons';

interface CameraViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type CameraError = {
  type: 'permission' | 'not-found' | 'generic';
  message: string;
};


export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<CameraError | null>(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const getMedia = async () => {
    setError(null);
    setCapturedImage(null);
    stopStream();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer rear camera
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError({
            type: 'permission',
            message: 'To identify your plant, we need access to your camera. Please enable camera permissions for this site in your browser\'s settings and try again.',
          });
        } else if (err.name === 'NotFoundError') {
           setError({
            type: 'not-found',
            message: 'No camera found on this device. Please ensure a camera is connected and enabled.',
          });
        } else {
          setError({
            type: 'generic',
            message: `An error occurred while accessing the camera: ${err.message}. Please try again.`
          });
        }
      } else {
        setError({
            type: 'generic',
            message: 'Could not access camera. An unknown error occurred.'
        });
      }
    }
  };

  useEffect(() => {
    getMedia();

    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopStream();
    }
  };

  const handleRetake = () => {
    getMedia();
  };

  const handleConfirm = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file);
        }
      }, 'image/jpeg');
    }
  };

  const renderErrorView = () => {
    if (!error) return null;

    const errorTitles = {
        permission: 'Camera Access Denied',
        'not-found': 'Camera Not Found',
        generic: 'Camera Error'
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md p-6 text-center animate-fade-in-up">
            <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{errorTitles[error.type]}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error.message}
            </p>
            <div className="flex justify-center gap-4">
                 <button onClick={onClose} className="px-6 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600">
                    Cancel
                </button>
                {error.type === 'permission' && (
                     <button onClick={getMedia} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};


  return (
    <div
      className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-title"
    >
      {error ? (
        renderErrorView()
      ) : (
        <>
          <h2 id="camera-title" className="sr-only">
            Plant Identification Camera
          </h2>
          <canvas ref={canvasRef} className="hidden" />
          <div className="relative w-full max-w-xl aspect-[4/5] sm:aspect-square bg-gray-900 overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured plant"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-12">
            {capturedImage ? (
              <>
                <button
                  onClick={handleRetake}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Retake photo"
                >
                  <RefreshIcon className="w-8 h-8" />
                </button>
                <button
                  onClick={handleConfirm}
                  className="p-5 bg-green-500 rounded-full text-white hover:bg-green-600 transition-colors shadow-lg"
                  aria-label="Confirm photo"
                >
                  <CheckIcon className="w-10 h-10" />
                </button>
              </>
            ) : (
              <button
                onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/50 ring-4 ring-black/20 transition-transform duration-200 hover:scale-110 active:scale-100"
                aria-label="Capture photo"
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label="Close camera"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};
