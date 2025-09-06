'use client'

import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showSidebarContent?: boolean;
}

const Layout = ({ children, className }: LayoutProps) => {
  const { isOpen: sidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  return (
    <Box className="flex h-screen bg-background">
      {isAuthenticated && (
        <Sidebar />
      )}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <Box
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          aria-label="Close sidebar overlay"
        />
      )}

      <Box className="flex flex-col flex-1 min-w-0 relative h-screen">
        <Header />
        <Box className="flex-1 overflow-y-auto">
          <Container maxWidth="xl" className='mt-8 pb-8 h-full'>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
