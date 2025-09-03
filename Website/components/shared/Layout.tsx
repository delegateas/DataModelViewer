'use client'

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/hooks/useSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showSidebarContent?: boolean;
}

const Layout = ({ children, className, showSidebarContent = false }: LayoutProps) => {
  const { isOpen: sidebarOpen, element: sidebarElement } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <Box className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      
      {/* Sidebar Content Area (when expanded and has content) */}
      {sidebarOpen && sidebarElement && showSidebarContent && (
        <Box className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <Box className="p-4">
            {sidebarElement}
          </Box>
        </Box>
      )}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <Box
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          aria-label="Close sidebar overlay"
        />
      )}

      <Box className="flex flex-col flex-1 min-w-0 relative">
        <Header />
        
        <Box 
          component="main"
          className={clsx(
            'flex-1 overflow-auto bg-white dark:bg-gray-900',
            'p-6',
            className
          )}
          aria-label="Main content"
        >
          <Box className="h-full max-w-full">
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
