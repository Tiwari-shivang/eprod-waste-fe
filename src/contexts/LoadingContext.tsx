import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  message: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  updateProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Processing...');

  const showLoader = useCallback((msg = 'Processing...') => {
    setMessage(msg);
    setProgress(0);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progress,
        message,
        showLoader,
        hideLoader,
        updateProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
