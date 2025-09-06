'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Box, IconButton, Input, InputAdornment, TextField } from '@mui/material';
import { SearchRounded } from '@mui/icons-material';

interface TimeSlicedSearchProps {
  onSearch: (value: string) => void;
  onLoadingChange: (loading: boolean) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  initialLocalValue: string;
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
  initialLocalValue,
  currentIndex = 0,
  totalResults = 0,
  placeholder = "Search attributes...",
}: TimeSlicedSearchProps) => {
  const [localValue, setLocalValue] = useState(initialLocalValue);
  const [isTyping, setIsTyping] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [lastValidSearch, setLastValidSearch] = useState('');
  const { isOpen } = useSidebar();
  const { isSettingsOpen } = useSettings();
  const isMobile = useIsMobile();
  
  const searchTimeoutRef = useRef<number>();
  const typingTimeoutRef = useRef<number>();
  const frameRef = useRef<number>();

  // Hide search on mobile when sidebar is open, or when settings are open
  const shouldHideSearch = (isMobile && isOpen) || isSettingsOpen;

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
    <Box className={`fixed top-20 right-0 z-50 w-[320px] transition-opacity duration-200 ${shouldHideSearch ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <TextField
        type="text"
        placeholder={placeholder}
        aria-label="Search attributes in tables"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-10"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        size="small"
        fullWidth
        sx={{
          backgroundColor: 'background.paper',
        }}
        slotProps={{
          input: {
              startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment>,
          }
        }}
      />
      
      {/* Clear button or loading indicator */}
      <Box className="absolute right-3 top-1/2 transform -translate-y-1/2 flex justify-center items-center">
        {isTyping && localValue.length >= 3 ? (
          <Box className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></Box>
        ) : localValue ? (
          <IconButton
            onClick={handleClear}
            className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );

  return portalRoot ? createPortal(searchInput, portalRoot) : null;
};
