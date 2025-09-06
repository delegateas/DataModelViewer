import React from 'react';
import { IconButton, Box, Typography, Button } from '@mui/material';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useSidebar } from '@/contexts/SidebarContext';

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
    const { isOpen, element, toggleExpansion } = useSidebar();
    
    const pathname = usePathname();

    const navItems: NavItem[] = [
        {
          label: 'Home',
          href: '/',
          icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="currentColor" d="M2 12.204c0-2.289 0-3.433.52-4.381c.518-.949 1.467-1.537 3.364-2.715l2-1.241C9.889 2.622 10.892 2 12 2s2.11.622 4.116 1.867l2 1.241c1.897 1.178 2.846 1.766 3.365 2.715S22 9.915 22 12.203v1.522c0 3.9 0 5.851-1.172 7.063S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.212S2 17.626 2 13.725z" opacity={0.5}></path><path fill="currentColor" d="M11.25 18a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0z"></path></svg>,
          active: pathname === '/',
          new: true
        },
        {
          label: 'Insights',
          href: '/insight',
          icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="currentColor" d="M6.222 4.601a9.5 9.5 0 0 1 1.395-.771c1.372-.615 2.058-.922 2.97-.33c.913.59.913 1.56.913 3.5v1.5c0 1.886 0 2.828.586 3.414s1.528.586 3.414.586H17c1.94 0 2.91 0 3.5.912c.592.913.285 1.599-.33 2.97a9.5 9.5 0 0 1-10.523 5.435A9.5 9.5 0 0 1 6.222 4.601" opacity={0.5}></path><path fill="currentColor" d="M21.446 7.069a8.03 8.03 0 0 0-4.515-4.515C15.389 1.947 14 3.344 14 5v4a1 1 0 0 0 1 1h4c1.657 0 3.053-1.39 2.446-2.931"></path></svg>,
          active: pathname === '/insight',
          disabled: true
        },
        {
          label: 'Metadata',
          href: '/metadata',
          icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="currentColor" d="M12 10c4.418 0 8-1.79 8-4s-3.582-4-8-4s-8 1.79-8 4s3.582 4 8 4"></path><path fill="currentColor" d="M4 12v6c0 2.21 3.582 4 8 4s8-1.79 8-4v-6c0 2.21-3.582 4-8 4s-8-1.79-8-4" opacity={0.5}></path><path fill="currentColor" d="M4 6v6c0 2.21 3.582 4 8 4s8-1.79 8-4V6c0 2.21-3.582 4-8 4S4 8.21 4 6" opacity={0.7}></path></svg>,
          active: pathname === '/metadata'
        },
        {
          label: 'Diagram',
          href: '/diagram',
          icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="currentColor" d="M20.849 8.713a3.932 3.932 0 0 0-5.562-5.561l-.887.887l.038.111a8.75 8.75 0 0 0 2.093 3.32a8.75 8.75 0 0 0 3.43 2.13z" opacity={0.5}></path><path fill="currentColor" d="m14.439 4l-.039.038l.038.112a8.75 8.75 0 0 0 2.093 3.32a8.75 8.75 0 0 0 3.43 2.13l-8.56 8.56c-.578.577-.867.866-1.185 1.114a6.6 6.6 0 0 1-1.211.748c-.364.174-.751.303-1.526.561l-4.083 1.361a1.06 1.06 0 0 1-1.342-1.341l1.362-4.084c.258-.774.387-1.161.56-1.525q.309-.646.749-1.212c.248-.318.537-.606 1.114-1.183z"></path><path fill="currentColor" d="M5.492 4.045L4.045 5.492C2.682 6.855 2 7.537 2 8.384s.682 1.53 2.045 2.893l1.558 1.558l.236-.236l6.996-6.996l-1.558-1.558C9.913 2.682 9.23 2 8.384 2s-1.529.682-2.892 2.045m12.904 7.119L11.4 18.16l-.236.236l1.56 1.559C14.086 21.318 14.767 22 15.615 22s1.529-.682 2.892-2.045l1.447-1.447C21.318 17.145 22 16.463 22 15.616c0-.848-.682-1.53-2.045-2.893z" opacity={0.5}></path><path fill="currentColor" d="m20.109 12.877l-1.17 1.17A.75.75 0 0 0 20 15.106l1.15-1.15a28 28 0 0 0-1.041-1.08M9.766 2.613L8.439 3.939A.75.75 0 1 0 9.5 5l1.365-1.364a15 15 0 0 0-1.1-1.022"></path></svg>,
          active: pathname === '/diagram'
        },
        {
          label: 'Processes',
          href: '/process',
          icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="currentColor" d="M16.443 7.328a.75.75 0 0 1 1.059-.056l1.737 1.564c.737.663 1.347 1.212 1.767 1.71c.44.525.754 1.088.754 1.784c0 .695-.313 1.258-.754 1.782c-.42.499-1.03 1.049-1.767 1.711l-1.737 1.564a.75.75 0 1 1-1.004-1.115l1.697-1.527c.788-.709 1.319-1.19 1.663-1.598c.33-.393.402-.622.402-.817c0-.196-.072-.425-.402-.818c-.344-.409-.875-.889-1.663-1.598l-1.697-1.527a.75.75 0 0 1-.056-1.06m-8.94 1.06a.75.75 0 0 0-1.004-1.115L4.761 8.836c-.737.663-1.347 1.212-1.767 1.71c-.44.525-.754 1.088-.754 1.784c0 .695.313 1.258.754 1.782c.42.499 1.03 1.049 1.767 1.711l1.737 1.564a.75.75 0 1 0 1.004-1.115l-1.697-1.527c-.788-.709-1.319-1.19-1.663-1.598c-.33-.393-.402-.622-.402-.817c0-.196.072-.425.402-.818c.344-.409.875-.889 1.663-1.598z"></path><path fill="currentColor" d="M14.182 4.276a.75.75 0 0 1 .53.918l-3.974 14.83a.75.75 0 1 1-1.449-.389l3.974-14.83a.75.75 0 0 1 .919-.53" opacity={0.5}></path></svg>,
          active: pathname === '/process',
          disabled: true
        }
    ];

  return (
    <Box 
      className={`relative flex flex-col items-start h-screen transition-all duration-300 ${isOpen ? 'w-sidebar-expanded' : 'w-sidebar'}`}
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
          {element !== null && (
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
                {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
            )}
            <Box
                component="img"
                src="/DMVLOGO.svg"
                alt="DMV Logo"
                className='h-12 p-1'
            />
        </Box>
        <Box className="flex h-full">
          <Box 
            className="flex flex-col items-center pt-4 w-sidebar h-full" 
            gap={2}
            sx={{
              borderRight: 1,
              borderColor: 'border.main'
            }}
          >
            {navItems.map((item, itemIndex) => (
                <Box key={itemIndex} className="relative w-full">
                    <Link
                        className={clsx(
                            'flex flex-col items-center px-4 py-1.5 mx-1 rounded-lg',
                            {
                                'text-blue-500 bg-blue-100': item.active,
                                'text-gray-300': item.disabled,
                                'text-gray-500': !item.disabled && !item.active
                            }
                        )}
                        href={!item.disabled ? item.href || '#' : '#'}
                        onClick={item.action}
                    >
                        {item.icon}
                        <Typography variant="body2" className="font-context text-xs text-center">
                            {item.label}
                        </Typography>
                    </Link>
                </Box>
            ))}
        </Box>
        {isOpen && element != null && element}
      </Box>
    </Box>
  )
};

export default Sidebar;
