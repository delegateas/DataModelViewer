import React, { FormEvent, useEffect, useState } from 'react'
import LoadingOverlay from '../shared/LoadingOverlay'
import { useLoading } from '@/hooks/useLoading'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, Box, Button, Container, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography, CircularProgress } from '@mui/material'
import { Info, Visibility, VisibilityOff, Warning } from '@mui/icons-material'
import { createSession } from '@/lib/session'
import { LastSynched } from '@/stubs/Data'
import { useRouter } from 'next/navigation'

interface LoginViewProps {

}

const LoginView = ({ }: LoginViewProps) => {

    const router = useRouter();
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

    useEffect(() => {
        fetch('/api/version')
            .then((res) => res.json())
            .then((data) => {
                setVersion(data.version);
                setEntraIdEnabled(data.entraIdEnabled || false);
                setPasswordAuthDisabled(data.passwordAuthDisabled || false);
            })
            .catch(() => setVersion('Unknown'))
    }, []);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleEntraIdLogin = () => {
        window.location.href = '/.auth/login/aad?post_login_redirect_uri=/';
    };

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startAuthentication();
        setShowIncorrectPassword(false);
        setAnimateError(false);

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
                setShowIncorrectPassword(true);
                setTimeout(() => setAnimateError(true), 10);
                stopAuthentication();
            }
        } catch (error) {
            console.error('Login error:', error);
            setShowIncorrectPassword(true);
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
                            severity="warning"
                            className={`w-full rounded-lg mt-4 transition-all duration-300 ease-out ${animateError
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-4 opacity-0'
                                }`}
                        >
                            The <b>password</b> is incorrect.
                        </Alert>
                    )}

                    {entraIdEnabled && (
                        <>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleEntraIdLogin}
                                className='rounded-lg mt-4'
                            >
                                <Box component="img" src="/MS_LOGO.svg" alt="Microsoft logo" className="w-6 h-6 mr-2" /> Sign in with Microsoft
                            </Button>
                            {!passwordAuthDisabled && (
                                <Divider className='w-full my-4'>
                                    <Typography variant="caption" color="textSecondary">OR</Typography>
                                </Divider>
                            )}
                        </>
                    )}

                    {!passwordAuthDisabled && (
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
                                    disabled={isAuthenticating}
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
                                disabled={isAuthenticating}
                                className='rounded-lg'
                                startIcon={isAuthenticating ? <CircularProgress size={16} color="inherit" /> : undefined}
                            >
                                {isAuthenticating ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
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
