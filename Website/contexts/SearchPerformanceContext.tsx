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

  const immediateUpdateMap = useRef<Map<number, MessageChannel>>(new Map());
  const scheduleImmediateUpdate = useCallback((callback: () => void): number => {
    const id = Date.now() + Math.random(); // Generate a unique id
    const channel = new MessageChannel();
    channel.port2.onmessage = () => {
      callback();
      immediateUpdateMap.current.delete(id); // Clean up after execution
    };
    immediateUpdateMap.current.set(id, channel);
    channel.port1.postMessage(null);
    return id;
  }, []);

  const scheduleBackgroundUpdate = useCallback((callback: () => void): number => {
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(callback, { timeout: 1000 });
      return id;
    } else {
      const id = setTimeout(callback, 0);
      return id as unknown as number; // Ensure consistent type
    }
  }, []);

  const cancelScheduledUpdate = useCallback((id: number) => {
    if (immediateUpdateMap.current.has(id)) {
      const channel = immediateUpdateMap.current.get(id);
      if (channel) {
        channel.port1.close();
        channel.port2.close();
      }
      immediateUpdateMap.current.delete(id);
    } else if ('cancelIdleCallback' in window) {
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
