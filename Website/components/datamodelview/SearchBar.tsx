'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { debounce } from '@/lib/utils';
import { useSearchPerformance } from '@/contexts/SearchPerformanceContext';

interface SearchBarProps {
  onSearch: (value: string) => void;
  onLoadingChange: (loading: boolean) => void;
  placeholder?: string;
  className?: string;
}

// Internal search component
const SearchInput = React.memo(({ 
  onSearch, 
  onLoadingChange, 
  placeholder = "Search attributes or entities...",
  className = "w-full px-4 py-2 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
}: SearchBarProps) => {
  // Local state - completely independent from parent
  const [localValue, setLocalValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { scheduleImmediateUpdate, scheduleBackgroundUpdate } = useSearchPerformance();
  
  // Debounced callback to parent - only sends updates, doesn't depend on parent state
  const debouncedOnSearch = useRef(
    debounce((value: string) => {
      // Schedule search as background task to not block UI
      scheduleBackgroundUpdate(() => {
        onSearch(value);
        scheduleImmediateUpdate(() => setIsTyping(false));
      });
    }, 350)
  ).current;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Immediate UI update with highest priority
    scheduleImmediateUpdate(() => {
      setLocalValue(value);
      
      if (!isTyping) {
        setIsTyping(true);
        onLoadingChange(true);
      }
    });
    
    debouncedOnSearch(value);
  }, [debouncedOnSearch, onLoadingChange, isTyping, scheduleImmediateUpdate]);

  return (
    <div className="fixed top-4 right-8 z-50 w-80 flex items-center gap-2">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        // Add visual feedback for typing
        style={{
          borderColor: isTyping ? '#3b82f6' : undefined,
          boxShadow: isTyping ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : undefined
        }}
      />
      {isTyping && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

// Portal wrapper for complete isolation
export const SearchBar = (props: SearchBarProps) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create a dedicated container for the search bar
    let container = document.getElementById('search-bar-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'search-bar-portal';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '1000';
      document.body.appendChild(container);
    }
    
    // Create a specific div for this search bar instance
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

  if (!portalRoot) return null;

  return createPortal(<SearchInput {...props} />, portalRoot);
};
