import React from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import { ChevronRight, Database, BarChart3, Settings, Info, Home, ChevronLeft, PencilRuler, PlugZap, ChartPie, LogOut, Sparkles } from 'lucide-react';
import { Logo } from '@/generated/Data';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useSidebar } from '@/hooks/useSidebar';

interface SidebarProps {
  className?: string;
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

interface NavGroup {
  items: NavItem[];
}

const Sidebar = ({ className }: SidebarProps) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          label: 'Home',
          href: '/',
          icon: <Home className="w-5 h-5" />,
          active: pathname === '/',
          new: true
        },
        {
          label: 'Insight viewer',
          href: '/insight',
          icon: <ChartPie className="w-5 h-5" />,
          active: pathname === '/insight',
          disabled: true
        },
        {
          label: 'Metadata viewer',
          href: '/metadata',
          icon: <Database className="w-5 h-5" />,
          active: pathname === '/metadata'
        },
        {
          label: 'Diagram viewer',
          href: '/diagram',
          icon: <PencilRuler className="w-5 h-5" />,
          active: pathname === '/diagram'
        },
        {
          label: 'Process viewer',
          href: '/process',
          icon: <PlugZap className="w-5 h-5" />,
          active: pathname === '/process',
          disabled: true
        }
      ]
    },
    {
      items: [
        {
          label: 'About',
          href: '/about',
          icon: <Info className="w-5 h-5" />,
          active: pathname === '/about'
        },
        {
          label: 'Sign out',
          icon: <LogOut className="w-5 h-5" />,
          action: () => {
            // Handle logout
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/auth/logout';
            document.body.appendChild(form);
            form.submit();
          }
        }
      ]
    }
  ];

  return (
    <Box className={`relative flex flex-col items-center h-screen border-r border-gray-200 bg-gray-50 transition-all duration-300 ${isOpen ? 'w-sidebar-expanded' : 'w-sidebar'}`}>
        <Box className='w-full h-header flex items-center justify-center relative'>
            <IconButton size='xsmall' onClick={toggleSidebar} className='absolute -right-3 border border-gray-200 bg-white'>
                {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
            <Box
                component="img"
                src="/DMVLOGO.svg"
                alt="DMV Logo"
                className='h-12 p-1'
            />
        </Box>
        <Box className="flex flex-col items-center" gap={2}>
            {navGroups.map((group, groupIndex) => (
                <Box key={groupIndex} className="flex flex-col items-center">
                    {group.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="relative">
                            {item.href ? (
                                <Link 
                                    href={item.href} 
                                    className={clsx(
                                        "flex items-center gap-2 p-2 flex-col rounded-lg transition-all duration-200",
                                        item.active 
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                                        item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                    )}
                                >
                                    {item.icon}
                                    {isOpen && (
                                        <Typography variant="body2" className="font-context text-xs text-center">
                                            {item.label}
                                        </Typography>
                                    )}
                                </Link>
                            ) : (
                                <button
                                    onClick={item.action}
                                    disabled={item.disabled}
                                    className={clsx(
                                        "flex items-center gap-2 p-2 flex-col rounded-lg transition-all duration-200",
                                        "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                                        item.disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {item.icon}
                                    {isOpen && (
                                        <Typography variant="body2" className="font-context text-xs text-center">
                                            {item.label}
                                        </Typography>
                                    )}
                                </button>
                            )}
                            {item.new && (
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="w-3 h-3 text-blue-500 fill-blue-500" />
                                </div>
                            )}
                        </div>
                    ))}
                </Box>
            ))}
        </Box>
    </Box>
  )
};

export default Sidebar;
