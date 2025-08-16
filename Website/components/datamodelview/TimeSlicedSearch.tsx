'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '../ui/input';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeSlicedSearchProps {
  onSearch: (value: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  currentIndex?: number;
  totalResults?: number;
  placeholder?: string;
}

// Time-sliced input that maintains 60fps regardless of background work
export const TimeSlicedSearch = ({ 
  onSearch, 
  onLoadingChange,
  onNavigateNext,
  onNavigatePrevious,
  currentIndex = 0,
  totalResults = 0,
  placeholder = "Search attributes...",
}: TimeSlicedSearchProps) => {
  const [localValue, setLocalValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [lastValidSearch, setLastValidSearch] = useState('');
  const { isOpen } = useSidebar();
  const isMobile = useIsMobile();
  
  const searchTimeoutRef = useRef<number>();
  const typingTimeoutRef = useRef<number>();
  const frameRef = useRef<number>();

  // Hide search on mobile when sidebar is open
  const shouldHideSearch = isMobile && isOpen;

  // Time-sliced debouncing using requestAnimationFrame
  const scheduleSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If we're going from a valid search to an invalid one, clear the search
    if (value.length < 3 && lastValidSearch.length >= 3) {
      onSearch('');
      setLastValidSearch('');
      setIsTyping(false);
      onLoadingChange(false);
      return;
    }

    // Don't search if less than 3 characters
    if (value.length < 3) {
      setIsTyping(false);
      onLoadingChange(false);
      return;
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      // Use MessageChannel for immediate callback without blocking main thread
      const channel = new MessageChannel();
      channel.port2.onmessage = () => {
        onSearch(value);
        setLastValidSearch(value);
        
        // Reset typing state in next frame
        frameRef.current = requestAnimationFrame(() => {
          setIsTyping(false);
        });
      };
      channel.port1.postMessage(null);
    }, 350);
  }, [onSearch, onLoadingChange, lastValidSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Immediate visual update (highest priority)
    setLocalValue(value);
    
    // Only manage typing state and loading for searches >= 3 characters
    if (value.length >= 3) {
      // Manage typing state
      if (!isTyping) {
        setIsTyping(true);
        onLoadingChange(true);
      }

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto-reset typing state if user stops typing
      typingTimeoutRef.current = window.setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } else {
      // Clear typing state for short searches
      setIsTyping(false);
      onLoadingChange(false);
      
      // Clear any pending timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    // Schedule search (will handle short searches internally)
    scheduleSearch(value);

  }, [isTyping, onLoadingChange, scheduleSearch]);

  // Handle clear button
  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearch(''); // Clear search immediately
    setIsTyping(false);
    onLoadingChange(false);
    
    // Clear any pending timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [onSearch, onLoadingChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue('');
      onSearch(''); // Only clear when explicitly using ESC
      setIsTyping(false);
      onLoadingChange(false);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onNavigateNext?.();
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onNavigatePrevious?.();
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      onNavigateNext?.();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      onNavigatePrevious?.();
    }
  }, [onNavigateNext, onNavigatePrevious, onSearch, onLoadingChange]);

  const hasResults = totalResults > 0;
  const showNavigation = hasResults && localValue.length >= 3;

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
    <div className={`fixed top-4 right-8 z-50 w-[280px] transition-opacity duration-200 ${shouldHideSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Search Input Container */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            aria-label="Search attributes in tables"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 h-9 text-sm"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
          {/* Clear button or loading indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex justify-center items-center">
            {isTyping && localValue.length >= 3 ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            ) : localValue ? (
              <button
                onClick={handleClear}
                className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        {showNavigation && (
          <div className="flex flex-col gap-0 bg-white rounded-lg border border-gray-300 shadow">
            <button
              onClick={onNavigatePrevious}
              disabled={currentIndex <= 1}
              className="p-1 rounded-t-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-gray-200"
              title="Previous result (Shift+Enter or Ctrl+↑)"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            
            <button
              onClick={onNavigateNext}
              disabled={currentIndex >= totalResults}
              className="p-1 rounded-b-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next result (Enter or Ctrl+↓)"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      
      {/* Results Counter */}
      {showNavigation && (
        <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
          <span className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 shadow-sm border">
            {totalResults > 0 ? (
              `${currentIndex} of ${totalResults} sections`
            ) : (
              'No results'
            )}
          </span>
          <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 shadow-sm border">
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> next section •
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">Shift+Enter</kbd> prev section •
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">Ctrl+↑↓</kbd> navigate
          </div>
        </div>
      )}
    </div>
  );

  return portalRoot ? createPortal(searchInput, portalRoot) : null;
};
