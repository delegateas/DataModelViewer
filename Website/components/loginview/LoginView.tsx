import React, { FormEvent, useEffect, useState } from 'react'
import LoginHeader from '../shared/LoginHeader'
import { Alert, Box, Button, Container, FormControl, IconButton, Input, InputAdornment, InputLabel, OutlinedInput, Paper, TextField, Typography } from '@mui/material'
import { Info, Visibility, VisibilityOff } from '@mui/icons-material'
import { createSession } from '@/lib/session'
import { LastSynched } from '@/stubs/Data'
import { useRouter } from 'next/navigation'

interface LoginViewProps {

}

const LoginView = ({ }: LoginViewProps) => {

    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [version, setVersion] = useState<string | null>(null);
    
    useEffect(() => {
        fetch('/api/version')
            .then((res) => res.json())
            .then((data) => setVersion(data.version))
            .catch(() => setVersion('Unknown'))
    }, []);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password")

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {
            await createSession(password?.valueOf() as string);
            router.push("/");
        } else {
            alert("Failed to login");
        }
    }

    return (
        <Box>
            <LoginHeader />
            <Box className="flex w-screen h-screen">
                <Box gap={2} className="hidden w-full max-w-[480px] md:flex flex-col p-4 h-full bg-gray-50 items-center justify-center">
                    <Typography variant='h4' fontWeight={700}>Hi, Welcome back</Typography>
                    <Typography variant='subtitle1' fontWeight={400}>More <span className='font-neue-machina font-semibold'>effective</span> with <span className='font-neue-machina font-semibold'>transparency</span></Typography>
                    <Box
                        component="img"
                        src="/dataviewer.svg"
                        alt="Data model viewer interface"
                        className="w-full h-auto object-contain p-8"
                    />
                </Box>
                <Container className="flex flex-col flex-1 items-start justify-center max-w-[420px]">
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
                    <form onSubmit={handleSubmit} className="w-full">
                        <FormControl className='w-full my-4' variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                className='rounded-lg'
                                id="outlined-adornment-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete='current-password'
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>
                        <Button fullWidth variant="contained" color="primary" type="submit" className='rounded-lg'>
                            Sign In
                        </Button>
                    </form>

                    <Typography variant="caption" color="textSecondary" className="mt-4">
                        Version: <b>{version ?? '...'}</b>
                    </Typography>
                </Container>
            </Box>
        </Box>
    )
}

export default LoginView
