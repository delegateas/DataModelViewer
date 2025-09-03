import { AppBar, Toolbar, Typography, Container, Box, LinearProgress } from '@mui/material';

interface LoginHeaderProps {
  className?: string;
  loading?: boolean;
}

const LoginHeader = ({ className, loading = false }: LoginHeaderProps) => {
  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0}
      className={className}
    >
      <Box className="mx-4">
        <Toolbar disableGutters className="justify-between">
          {/* Logo section */}
          <Box className="flex items-center">
            <Box
              component="img"
              src="/DMVLOGO.svg"
              alt="DMV Logo"
              className='mr-1 h-12 p-1'
            />
          </Box>

          {/* Right side - placeholder for future navigation */}
          <Box>
            {/* Future navigation items can go here */}
          </Box>
        </Toolbar>
        
        {/* Loading bar at the bottom of the header */}
        {loading && (
          <Box 
            className="absolute bottom-0 left-0 right-0 h-1"
            aria-label="Loading progress"
          >
            <LinearProgress 
              className="h-1 bg-black/10 dark:bg-white/10 [&_.MuiLinearProgress-bar]:bg-blue-600 dark:[&_.MuiLinearProgress-bar]:bg-blue-400"
              aria-label="Loading indicator"
            />
          </Box>
        )}
      </Box>
    </AppBar>
  );
};

export default LoginHeader;