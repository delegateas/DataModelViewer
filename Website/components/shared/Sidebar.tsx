import React from 'react';
import { IconButton, Box, Typography, alpha, Badge, Tooltip } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { DiagramIcon, HomeIcon, InsightsIcon, MetadataIcon, ProcessesIcon } from '@/lib/icons';

interface SidebarProps {

}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  caption?: string;
  new?: boolean;
  action?: () => void;
}

const Sidebar = ({ }: SidebarProps) => {
  const { isOpen, element, toggleExpansion, close } = useSidebar();
  const isMobile = useIsMobile();

  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: HomeIcon,
      active: pathname === '/',
    },
    {
      label: 'Insights',
      href: '/insights',
      icon: InsightsIcon,
      active: pathname === '/insights',
    },
    {
      label: 'Metadata',
      href: '/metadata',
      icon: MetadataIcon,
      active: pathname === '/metadata',
    },
    {
      label: 'Diagram',
      href: '/diagram',
      icon: DiagramIcon,
      active: pathname === '/diagram',
      new: true,
    },
    {
      label: 'Processes',
      href: '/processes',
      icon: ProcessesIcon,
      active: pathname === '/processes',
    }
  ];

  const handleNavClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <Box
      className={`relative flex flex-col items-start h-screen transition-all duration-300 ${isMobile ? 'shadow-lg' : (isOpen ? 'w-sidebar-expanded' : 'w-sidebar')
        }`}
      sx={{
        borderRight: 1,
        borderColor: 'border.main',
        bgcolor: 'background.paper'
      }}
    >
      <Box
        className='w-full min-h-header h-header flex items-center justify-center relative'
        sx={{
          borderBottom: 1,
          borderColor: 'border.main'
        }}
      >
        {element !== null && !isMobile && (
          <IconButton
            size='xsmall'
            onClick={toggleExpansion}
            sx={{
              position: 'absolute',
              right: '-12px',
              border: 1,
              borderColor: 'border.main',
              bgcolor: 'background.paper',
              zIndex: 50,
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            {isOpen ? <ChevronLeftRounded /> : <ChevronRightRounded />}
          </IconButton>
        )}

        {/* Mobile close button */}
        {isMobile && isOpen && (
          <IconButton
            size='small'
            onClick={close}
            sx={{
              position: 'absolute',
              right: '-16px',
              border: 1,
              borderColor: 'border.main',
              bgcolor: 'background.paper',
              zIndex: 50,
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
              <path fill="currentColor" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7L10.6 12L5.7 7.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275L12 10.6l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z" />
            </svg>
          </IconButton>
        )}

        <Box
          component="img"
          src="/DMVLOGO.svg"
          alt="DMV Logo"
          className='h-12 p-1'
        />
      </Box>
      <Box className="flex flex-1 w-full min-h-0">
        <Box
          className="flex flex-col items-center pt-4 w-sidebar flex-shrink-0"
          gap={2}
          sx={{
            borderRight: 1,
            borderColor: 'border.main'
          }}
        >
          {navItems.map((item, itemIndex) => (
            <Tooltip key={itemIndex} title={item.disabled ? `Coming soon... (${item.label})` : item.label} placement="right" arrow>
              <Box key={itemIndex} className="relative w-full max-w-full">
                <Badge variant='dot' color='primary' className='w-full' invisible={!item.new} key={itemIndex} sx={{ '& .MuiBadge-badge': { top: 8, right: 8 } }}>
                  <Link
                    className="w-full"
                    href={!item.disabled ? item.href || '#' : '#'}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      }
                      if (!item.disabled) {
                        handleNavClick();
                      }
                    }}
                  >
                    <Box
                      className="flex flex-col items-center px-4 py-1.5 mx-1 rounded-lg relative"
                      sx={{
                        color: item.active
                          ? 'primary.main'
                          : item.disabled
                            ? 'text.disabled'
                            : 'text.secondary',
                        backgroundColor: item.active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: item.disabled
                            ? 'transparent'
                            : item.active
                              ? (theme) => alpha(theme.palette.primary.main, 0.16)
                              : 'action.hover',
                          color: item.disabled ? 'text.disabled' : 'text.primary',
                        }
                      }}
                    >
                      <Box className="h-6 w-6">
                        {item.icon}
                      </Box>
                      <Typography variant="body2" className="text-xs text-center">
                        {item.label}
                      </Typography>
                    </Box>
                  </Link>
                </Badge>
              </Box>
            </Tooltip>
          ))}
        </Box>
        {isOpen && element != null && (
          <Box className="overflow-y-auto no-scrollbar flex-1 min-h-0">
            {element}
          </Box>
        )}
      </Box>
    </Box>
  )
};

export default Sidebar;
