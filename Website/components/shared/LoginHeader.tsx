import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';

interface LoginHeaderProps {
  className?: string;
}

const LoginHeader = ({ className }: LoginHeaderProps) => {
  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0}
      className={className}
    >
      <Container maxWidth="xl">
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
      </Container>
    </AppBar>
  );
};

export default LoginHeader;