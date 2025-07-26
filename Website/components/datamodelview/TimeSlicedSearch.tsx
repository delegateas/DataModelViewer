'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface TimeSlicedSearchProps {
  onSearch: (value: string) => void;
  onLoadingChange: (loading: boolean) => void;
  placeholder?: string;
  className?: string;
}

// Time-sliced input that maintains 60fps regardless of background work
export const TimeSlicedSearch = ({ 
  onSearch, 
  onLoadingChange, 
  placeholder = "Search attributes or tables...",
  className = "w-full px-4 py-2 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
}: TimeSlicedSearchProps) => {
  const [localValue, setLocalValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  
  const searchTimeoutRef = useRef<number>();
  const typingTimeoutRef = useRef<number>();
  const frameRef = useRef<number>();

  // Time-sliced debouncing using requestAnimationFrame
  const scheduleSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      // Use MessageChannel for immediate callback without blocking main thread
      const channel = new MessageChannel();
      channel.port2.onmessage = () => {
        onSearch(value);
        
        // Reset typing state in next frame
        frameRef.current = requestAnimationFrame(() => {
          setIsTyping(false);
        });
      };
      channel.port1.postMessage(null);
    }, 350);
  }, [onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Immediate visual update (highest priority)
    setLocalValue(value);
    
    // Manage typing state
    if (!isTyping) {
      setIsTyping(true);
      onLoadingChange(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Schedule search
    scheduleSearch(value);
    
    // Auto-reset typing state if user stops typing
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 2000);

  }, [isTyping, onLoadingChange, scheduleSearch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Portal setup
  useEffect(() => {
    let container = document.getElementById('time-sliced-search-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'time-sliced-search-portal';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    const searchContainer = document.createElement('div');
    searchContainer.style.pointerEvents = 'auto';
    container.appendChild(searchContainer);
    setPortalRoot(searchContainer);

    return () => {
      if (searchContainer && container?.contains(searchContainer)) {
        container.removeChild(searchContainer);
      }
    };
  }, []);

  const searchInput = (
    <div className="fixed top-4 right-8 z-50 w-80 flex items-center gap-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
            type="text"
            placeholder="Search attributes in tables..."
            aria-label="Search attributes in tables"
            value={localValue}
            onChange={handleChange}
            className="pl-8 pr-8 h-8 text-xs"
            spellCheck={false}
            autoComplete="off"
        />
      {isTyping && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );

  return portalRoot ? createPortal(searchInput, portalRoot) : null;
};
