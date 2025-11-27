'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Box, CircularProgress, Divider, IconButton, InputAdornment, InputBase, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Typography } from '@mui/material';
import { ClearRounded, InfoRounded, KeyboardArrowDownRounded, KeyboardArrowUpRounded, NavigateBeforeRounded, NavigateNextRounded, SearchRounded } from '@mui/icons-material';

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
  currentIndex,
  totalResults,
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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (localValue.length === 0) return;
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
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [localValue, onSearch, onLoadingChange, onNavigateNext, onNavigatePrevious]);

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
    if (localValue.length === 0) return; // No-op if already empty
    handleClose();
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
  }, [onSearch, onLoadingChange, localValue]);

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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (open) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Close menu when focus moves back to search input or elsewhere
  const handleSearchFocus = () => {
    if (open) {
      setAnchorEl(null);
    }
  };

  const searchInput = (
    <Box className={`fixed flex top-20 md:top-24 m-auto w-full justify-center md:justify-end md:right-4 z-50 transition-opacity bg-transparent duration-200 pointer-events-none ${shouldHideSearch ? 'opacity-0' : 'opacity-100'}`}>
      <Paper component="form" className={`p-1 rounded-lg flex items-center w-[320px] ${shouldHideSearch ? 'pointer-events-none' : 'pointer-events-auto'}`} sx={{ backgroundColor: 'background.paper' }}>
        <InputAdornment position="start" className='ml-1'>
          <SearchRounded color="action" />
        </InputAdornment>

        <Divider orientation="vertical" className='mr-1 h-6' />

        <InputBase
          className='ml-1 flex-1'
          type="text"
          placeholder={placeholder}
          aria-label="Search attributes in tables"
          value={localValue}
          onChange={handleChange}
          onFocus={handleSearchFocus}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          sx={{ backgroundColor: 'transparent' }}
        />

        <InputAdornment position="end">
          {isTyping && localValue.length >= 3 ? (
            <CircularProgress size={20} />
          ) : localValue && totalResults !== undefined && totalResults > 0 ? (
            <Typography
              variant='caption'
              color="text.secondary"
              className='px-2 font-mono'
              sx={{ minWidth: '40px', textAlign: 'center' }}
            >
              {currentIndex}/{totalResults}
            </Typography>
          ) : null}
        </InputAdornment>

        <Divider orientation="vertical" className='mx-1 h-6' />

        <IconButton onClick={handleClick} size="small">
          <InfoRounded fontSize="small" color="action" />
        </IconButton>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className='mt-2'
      >
        <MenuList dense className='w-64'>
          <MenuItem disabled={localValue.length < 3} onClick={onNavigateNext}>
            <ListItemIcon>
              <NavigateNextRounded />
            </ListItemIcon>
            <ListItemText>Next</ListItemText>
            <Typography variant='body2' color="text.secondary">Enter</Typography>
          </MenuItem>
          <MenuItem disabled={localValue.length < 3} onClick={onNavigatePrevious}>
            <ListItemIcon>
              <NavigateBeforeRounded />
            </ListItemIcon>
            <ListItemText>Previous</ListItemText>
            <Typography variant='body2' color="text.secondary">Shift + Enter</Typography>
          </MenuItem>
          <MenuItem disabled={localValue.length < 3} onClick={onNavigateNext}>
            <ListItemIcon>
              <NavigateNextRounded />
            </ListItemIcon>
            <ListItemText>Next</ListItemText>
            <Typography variant='body2' color="text.secondary">Ctrl + <KeyboardArrowDownRounded /></Typography>
          </MenuItem>
          <MenuItem disabled={localValue.length < 3} onClick={onNavigatePrevious}>
            <ListItemIcon>
              <NavigateBeforeRounded />
            </ListItemIcon>
            <ListItemText>Previous</ListItemText>
            <Typography variant='body2' color="text.secondary">Ctrl + <KeyboardArrowUpRounded /></Typography>
          </MenuItem>
          <Divider />
          <MenuItem disabled={localValue.length === 0} onClick={handleClear}>
            <ListItemIcon>
              <ClearRounded />
            </ListItemIcon>
            <ListItemText>Clear</ListItemText>
            <Typography variant='body2' color="text.secondary">Esc</Typography>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );

  return portalRoot ? createPortal(searchInput, portalRoot) : null;
};
