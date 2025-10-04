import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper } from '@mui/material'

interface IInfoCardProps {
    title: string
    value: number | string
    iconSrc: JSX.Element
    color: string
}

export const InfoCard = ({ 
    title, 
    value, 
    iconSrc,
    color, 
}: IInfoCardProps) => {
    const [animatedValue, setAnimatedValue] = useState(0)
    const targetValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0

    useEffect(() => {
        if (targetValue === 0) {
            setAnimatedValue(0)
            return
        }

        const duration = 1000 
        const steps = 60
        const increment = targetValue / steps
        const stepDuration = duration / steps

        let currentStep = 0
        const timer = setInterval(() => {
            currentStep++
            const newValue = Math.min(Math.round(increment * currentStep), targetValue)
            setAnimatedValue(newValue)

            if (currentStep >= steps || newValue >= targetValue) {
                setAnimatedValue(targetValue)
                clearInterval(timer)
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [targetValue])

    return (
        <Paper elevation={2} className="p-4 flex rounded-2xl items-center justify-between overflow-hidden">
            <Box className="flex flex-col ml-4">
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                    {title}
                </Typography>
                <Typography variant="h4" className='py-2 font-semibold' sx={{ color: 'text.primary' }}>
                    {animatedValue}
                </Typography>
            </Box>
            <Box className='relative h-24 w-24 flex items-center justify-center'>
                <Box className="z-10 h-14 w-14" sx={{ color: color }}>{iconSrc}</Box>
                <Box className="absolute rounded-4xl rotate-[30deg] -right-1/2 -top-1/4 w-[150%] h-[150%] opacity-20" sx={{ backgroundColor: color }} />
            </Box>
        </Paper>
    )
}