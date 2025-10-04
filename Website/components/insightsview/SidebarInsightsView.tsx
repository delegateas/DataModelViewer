'use client'

import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { OverviewIcon, SolutionIcon, ComplianceIcon } from '@/lib/icons';

interface SidebarInsightsViewProps {

}

interface InsightsSubMenuItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const SidebarInsightsView = ({ }: SidebarInsightsViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { close: closeSidebar } = useSidebar();
  const isMobile = useIsMobile();
  
  const currentView = searchParams.get('view') || 'solutions';

  const menuItems: InsightsSubMenuItem[] = [
    {
      label: 'Overview',
      value: 'overview',
      icon: OverviewIcon,
    },
    {
      label: 'Solutions',
      value: 'solutions',
      icon: SolutionIcon,
    },
    {
      label: 'Compliance',
      value: 'compliance',
      icon: ComplianceIcon,
      disabled: true,
    },
  ];

  const handleMenuItemClick = (value: string, disabled?: boolean) => {
    if (disabled) return;
    
    const newUrl = `/insights?view=${value}`;
    router.push(newUrl);
    
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <Box className="w-full h-full p-4">
      <Typography 
        variant="h6" 
        className="mb-4 font-semibold"
        sx={{ color: 'text.primary' }}
      >
        Insights
      </Typography>
      
      <List className="space-y-1">
        {menuItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.value, item.disabled)}
              disabled={item.disabled}
              selected={currentView === item.value}
              className="rounded-lg"
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': {
                  backgroundColor: (theme) => theme.palette.primary.main + '1F',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.main + '29',
                  },
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                },
              }}
            >
              <ListItemIcon
                className="w-6 h-6"
                sx={{
                  minWidth: '36px',
                  color: currentView === item.value ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { 
                    fontWeight: currentView === item.value ? 'medium' : 'normal',
                    color: currentView === item.value ? 'primary.main' : 'text.secondary'
                  }
                }}
              />
              {item.disabled && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.disabled',
                    fontSize: '0.7rem',
                    fontStyle: 'italic'
                  }}
                >
                  Coming soon
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SidebarInsightsView;