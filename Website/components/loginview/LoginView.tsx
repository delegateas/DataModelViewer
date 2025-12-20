import React, { FormEvent, useEffect, useState } from 'react'
import LoadingOverlay from '../shared/LoadingOverlay'
import { useLoading } from '@/hooks/useLoading'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, Box, Button, Container, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography, CircularProgress, Skeleton } from '@mui/material'
import { Info, Visibility, VisibilityOff, Warning } from '@mui/icons-material'
import { createSession } from '@/lib/session'
import { LastSynched } from '@/stubs/Data'
import { useRouter, useSearchParams } from 'next/navigation'

interface LoginViewProps {

}

const LoginView = ({ }: LoginViewProps) => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthenticated } = useAuth();
    const {
        isAuthenticating,
        isRedirecting,
        startAuthentication,
        startRedirection,
        stopAuthentication,
        resetAuthState
    } = useLoading();

    const [showPassword, setShowPassword] = useState(false);
    const [version, setVersion] = useState<string | null>(null);
    const [showIncorrectPassword, setShowIncorrectPassword] = useState<boolean>(false);
    const [animateError, setAnimateError] = useState<boolean>(false);
    const [entraIdEnabled, setEntraIdEnabled] = useState<boolean>(false);
    const [passwordAuthDisabled, setPasswordAuthDisabled] = useState<boolean>(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
    const [isEntraIdAuthenticating, setIsEntraIdAuthenticating] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('The password is incorrect.');
    const [isLockedOut, setIsLockedOut] = useState<boolean>(false);

    useEffect(() => {
        // Check for authentication errors in URL
        const error = searchParams.get('error');
        if (error) {
            setAuthError('Access denied. You are not a member of an authorized security group or not in a correct tenant.');
            setIsEntraIdAuthenticating(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetch('/api/version')
            .then((res) => res.json())
            .then((data) => {
                setVersion(data.version);
                setEntraIdEnabled(data.entraIdEnabled || false);
                setPasswordAuthDisabled(data.passwordAuthDisabled || false);
            })
            .catch(() => setVersion('Unknown'))
            .finally(() => setIsLoadingConfig(false));
    }, []);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleEntraIdLogin = async () => {
        setIsEntraIdAuthenticating(true);
        try {
            // Use NextAuth signIn
            const { signIn } = await import('next-auth/react');
            await signIn('microsoft-entra-id', { callbackUrl: '/' });
        } catch (error) {
            console.error('EntraID login error:', error);
            setIsEntraIdAuthenticating(false);
        }
    };

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startAuthentication();
        setShowIncorrectPassword(false);
        setAnimateError(false);
        setIsLockedOut(false);

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password")

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                await createSession(password?.valueOf() as string);
                setAuthenticated(true); // Update auth context immediately
                startRedirection();
                router.push("/");
            } else {
                const data = await response.json();

                if (response.status === 429) {
                    // Rate limited / locked out
                    setIsLockedOut(true);
                    setErrorMessage(data.error || 'Too many failed attempts. Please try again later.');
                } else if (response.status === 401) {
                    // Invalid password
                    setIsLockedOut(false);
                    setErrorMessage(data.error || 'The password is incorrect.');
                }

                setShowIncorrectPassword(true);
                setTimeout(() => setAnimateError(true), 10);
                stopAuthentication();
            }
        } catch (error) {
            console.error('Login error:', error);
            setShowIncorrectPassword(true);
            setIsLockedOut(false);
            setErrorMessage('An error occurred. Please try again.');
            setTimeout(() => setAnimateError(true), 10);
            resetAuthState();
        }
    }

    return (
        <Box className="h-full">
            <LoadingOverlay
                open={isRedirecting}
                message="Redirecting to dashboard..."
            />
            <Box className="flex w-full h-full">
                <Box gap={2} className="hidden w-full max-w-[480px] md:flex flex-col p-4 h-full items-center justify-center">
                    <Typography variant='h4' fontWeight={700}>Hi, Welcome back</Typography>
                    <Typography variant='subtitle1' fontWeight={400}>More <span className='font-semibold'>effective</span> with <span className='font-semibold'>transparency</span></Typography>
                    <Box
                        component="img"
                        src="/4716572.svg"
                        alt="Data model viewer interface"
                        className="w-full h-auto object-contain p-8"
                    />
                </Box>
                <Container className="flex flex-col flex-1 items-start justify-center max-w-[480px]">
                    <Typography variant="h6" fontWeight={600} className="mt-20 mb-4 text-center">Sign in to your organization</Typography>
                    <Alert icon={<Info />} severity="info" className='w-full rounded-lg'>
                        Last synchronization: <b>{LastSynched ? LastSynched.toLocaleString('en-DK', {
                            timeZone: 'Europe/Copenhagen',
                            timeZoneName: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '...'}</b>
                    </Alert>
                    {showIncorrectPassword && (
                        <Alert
                            icon={<Warning />}
                            severity={isLockedOut ? "error" : "warning"}
                            className={`w-full rounded-lg mt-4 transition-all duration-300 ease-out ${animateError
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-4 opacity-0'
                                }`}
                        >
                            {errorMessage}
                        </Alert>
                    )}
                    {authError && (
                        <Alert
                            icon={<Warning />}
                            severity="error"
                            className="w-full rounded-lg mt-4"
                            onClose={() => setAuthError(null)}
                        >
                            {authError}
                        </Alert>
                    )}

                    {isLoadingConfig ? (
                        <>
                            <Skeleton variant="rectangular" className='w-full rounded-lg mt-4' height={42} />
                            <Divider className='w-full my-4'>
                                <Typography variant="caption" color="textSecondary">OR</Typography>
                            </Divider>
                        </>
                    ) : (
                        entraIdEnabled && (
                            <>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleEntraIdLogin}
                                    disabled={isEntraIdAuthenticating}
                                    className='rounded-lg mt-4'
                                    startIcon={isEntraIdAuthenticating ? <CircularProgress size={16} color="inherit" /> : undefined}
                                >
                                    {isEntraIdAuthenticating ? (
                                        'Signing in with Microsoft...'
                                    ) : (
                                        <>
                                            <Box component="img" src="/MS_LOGO.svg" alt="Microsoft logo" className="w-6 h-6 mr-2" /> Sign in with Microsoft
                                        </>
                                    )}
                                </Button>
                                {!passwordAuthDisabled && (
                                    <Divider className='w-full my-4'>
                                        <Typography variant="caption" color="textSecondary">OR</Typography>
                                    </Divider>
                                )}
                            </>
                        )
                    )}

                    {isLoadingConfig ? (
                        <Box className="w-full">
                            <Skeleton variant="rectangular" className='w-full rounded-lg my-4' height={56} />
                            <Skeleton variant="rectangular" className='w-full rounded-lg' height={42} />
                        </Box>
                    ) : (
                        !passwordAuthDisabled && (
                            <form onSubmit={handleSubmit} className="w-full">
                                <FormControl className='w-full my-4' variant="outlined"
                                    sx={{
                                        '& input:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 100px var(--mui-palette-background-default) inset !important',
                                            WebkitTextFillColor: 'var(--mui-palette-text-primary) !important',
                                            transition: 'background-color 5000s ease-in-out 0s',
                                        },
                                    }}>
                                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                    <OutlinedInput
                                        className='rounded-lg'
                                        id="outlined-adornment-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete='current-password'
                                        disabled={isAuthenticating || isLockedOut}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={handleClickShowPassword}
                                                    disabled={isAuthenticating}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Password"
                                    />
                                </FormControl>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isAuthenticating || isLockedOut}
                                    className='rounded-lg'
                                    startIcon={isAuthenticating ? <CircularProgress size={16} color="inherit" /> : undefined}
                                >
                                    {isAuthenticating ? 'Signing In...' : isLockedOut ? 'Account Locked' : 'Sign In'}
                                </Button>
                            </form>
                        )
                    )}

                    <Typography variant="caption" color="textSecondary" className="mt-4 w-full text-end">
                        Version: <b>{version ?? '...'}</b>
                    </Typography>
                </Container>
            </Box>
        </Box>
    )
}

export default LoginView
