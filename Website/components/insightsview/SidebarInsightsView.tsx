'use client'

import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';

const ComplianceIcon = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
	<path fill="currentColor" d="M14 2.75c1.907 0 3.262.002 4.29.14c1.005.135 1.585.389 2.008.812c.487.487.7.865.817 1.538c.132.759.135 1.84.135 3.76a.75.75 0 0 0 1.5 0v-.096c0-1.8 0-3.018-.158-3.922c-.175-1.005-.549-1.656-1.233-2.34c-.749-.75-1.698-1.081-2.87-1.239c-1.14-.153-2.595-.153-4.433-.153H14a.75.75 0 0 0 0 1.5M2 14.25a.75.75 0 0 1 .75.75c0 1.92.003 3.001.135 3.76c.118.673.33 1.051.817 1.538c.423.423 1.003.677 2.009.812c1.028.138 2.382.14 4.289.14a.75.75 0 0 1 0 1.5h-.056c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.684-.685-1.058-1.336-1.233-2.341c-.158-.904-.158-2.123-.158-3.922V15a.75.75 0 0 1 .75-.75m20 0a.75.75 0 0 1 .75.75v.096c0 1.8 0 3.018-.158 3.922c-.175 1.005-.549 1.656-1.233 2.34c-.749.75-1.698 1.081-2.87 1.239c-1.14.153-2.595.153-4.433.153H14a.75.75 0 0 1 0-1.5c1.907 0 3.262-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812c.487-.487.7-.865.817-1.538c.132-.759.135-1.84.135-3.76a.75.75 0 0 1 .75-.75m-12.056-13H10a.75.75 0 0 1 0 1.5c-1.907 0-3.261.002-4.29.14c-1.005.135-1.585.389-2.008.812c-.487.487-.7.865-.817 1.538c-.132.759-.135 1.84-.135 3.76a.75.75 0 1 1-1.5 0v-.096c0-1.8 0-3.018.158-3.922c.175-1.005.549-1.656 1.233-2.34c.749-.75 1.698-1.081 2.87-1.239c1.14-.153 2.595-.153 4.433-.153" opacity={0.5}></path>
	<path fill="currentColor" d="M12 10.75a1.25 1.25 0 1 0 0 2.5a1.25 1.25 0 0 0 0-2.5"></path>
	<path fill="currentColor" fillRule="evenodd" d="M5.892 14.06C5.297 13.37 5 13.025 5 12s.297-1.37.892-2.06C7.08 8.562 9.072 7 12 7s4.92 1.562 6.108 2.94c.595.69.892 1.035.892 2.06s-.297 1.37-.892 2.06C16.92 15.438 14.928 17 12 17s-4.92-1.562-6.108-2.94M9.25 12a2.75 2.75 0 1 1 5.5 0a2.75 2.75 0 0 1-5.5 0" clipRule="evenodd"></path>
</svg>

const SolutionIcon = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
	<path fill="currentColor" d="M2 6.95c0-.883 0-1.324.07-1.692A4 4 0 0 1 5.257 2.07C5.626 2 6.068 2 6.95 2c.386 0 .58 0 .766.017a4 4 0 0 1 2.18.904c.144.119.28.255.554.529L11 4c.816.816 1.224 1.224 1.712 1.495a4 4 0 0 0 .848.352C14.098 6 14.675 6 15.828 6h.374c2.632 0 3.949 0 4.804.77q.119.105.224.224c.77.855.77 2.172.77 4.804V14c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14z" opacity={0.5}></path>
	<path fill="currentColor" d="M20 6.238c0-.298-.005-.475-.025-.63a3 3 0 0 0-2.583-2.582C17.197 3 16.965 3 16.5 3H9.988c.116.104.247.234.462.45L11 4c.816.816 1.224 1.224 1.712 1.495a4 4 0 0 0 .849.352C14.098 6 14.675 6 15.829 6h.373c1.78 0 2.957 0 3.798.238"></path>
	<path fill="currentColor" fillRule="evenodd" d="M12.25 10a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75" clipRule="evenodd"></path>
</svg>

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