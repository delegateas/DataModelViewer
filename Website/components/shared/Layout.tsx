'use client'

import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showSidebarContent?: boolean;
}

const Layout = ({ children }: LayoutProps) => {
  const { isOpen: sidebarOpen, close } = useSidebar();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  return (
    <Box className="flex h-screen bg-background">
      {isAuthenticated && (
        <Box 
          className={`${
            isMobile 
              ? `fixed top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }` 
              : ''
          }`}
          style={isMobile ? { left: 0 } : {}}
        >
          <Sidebar />
        </Box>
      )}

      {/* Mobile overlay */}
      {isMobile && isAuthenticated && (
        <Box
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Close sidebar overlay"
          onClick={close}
        />
      )}

      <Box className="flex flex-col flex-1 min-w-0 relative h-screen">
        <Header />
        <Box className="flex-1 overflow-y-auto" sx={{ backgroundColor: 'background.default' }}>
          <Container maxWidth="xl" className='h-full w-full'>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
