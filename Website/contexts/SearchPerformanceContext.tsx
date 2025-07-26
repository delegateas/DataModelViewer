'use client'

import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react';

interface SearchPerformanceContextType {
  scheduleImmediateUpdate: (callback: () => void) => void;
  scheduleBackgroundUpdate: (callback: () => void) => void;
  cancelScheduledUpdate: (id: number) => void;
}

const SearchPerformanceContext = createContext<SearchPerformanceContextType | null>(null);

export const SearchPerformanceProvider = ({ children }: { children: ReactNode }) => {
  const immediateUpdatesRef = useRef<Set<() => void>>(new Set());
  const backgroundUpdatesRef = useRef<Set<() => void>>(new Set());

  const scheduleImmediateUpdate = useCallback((callback: () => void) => {
    // Use MessageChannel for immediate, non-blocking updates
    const channel = new MessageChannel();
    channel.port2.onmessage = () => {
      callback();
    };
    channel.port1.postMessage(null);
  }, []);

  const scheduleBackgroundUpdate = useCallback((callback: () => void) => {
    // Use requestIdleCallback for background updates when browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 1000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(callback, 0);
    }
  }, []);

  const cancelScheduledUpdate = useCallback((id: number) => {
    if ('cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }, []);

  const value = {
    scheduleImmediateUpdate,
    scheduleBackgroundUpdate,
    cancelScheduledUpdate
  };

  return (
    <SearchPerformanceContext.Provider value={value}>
      {children}
    </SearchPerformanceContext.Provider>
  );
};

export const useSearchPerformance = () => {
  const context = useContext(SearchPerformanceContext);
  if (!context) {
    throw new Error('useSearchPerformance must be used within SearchPerformanceProvider');
  }
  return context;
};
