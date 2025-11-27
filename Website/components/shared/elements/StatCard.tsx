import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Tooltip } from '@mui/material'
import { WarningRounded } from '@mui/icons-material'

interface IStatCardProps {
    title: string
    value: number | string
    highlightedWord: string
    tooltipTitle?: string
    tooltipWarning?: string
    imageSrc: string
    imageAlt?: string
}

export const StatCard = ({
    title,
    value,
    highlightedWord,
    tooltipTitle,
    tooltipWarning,
    imageSrc,
    imageAlt = "Icon"
}: IStatCardProps) => {
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

    const fullTitle = `${highlightedWord} ${title}`;

    return (
        <Paper variant='outlined' className="p-4 flex rounded-2xl items-center justify-between">
            <Box className="flex flex-col mr-4">
                <Tooltip title={fullTitle} arrow>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5,
                        }}
                    >
                        <b>{highlightedWord}</b> {title}
                    </Typography>
                </Tooltip>
                <Typography variant="h4" className='py-2 font-semibold' sx={{ color: 'text.primary' }}>
                    {animatedValue}
                </Typography>
                {(tooltipTitle && tooltipWarning) ? (
                    <Tooltip arrow title={tooltipTitle}>
                        <span className='flex items-center h-4'>
                            <WarningRounded color='warning' className='mr-1 w-5' />
                            <Typography color="warning" variant="caption">
                                See <b>{tooltipWarning}</b>
                            </Typography>
                        </span>
                    </Tooltip>) : <Box className="mb-4" />}
            </Box>
            <Box className='relative rounded-full min-h-24 min-w-24 h-24 w-24 flex items-center justify-center' sx={{ backgroundColor: 'grey.100' }}>
                <Box component="img" src={imageSrc} alt={imageAlt} className='absolute w-14 h-14' />
            </Box>
        </Paper>
    )
}