'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardActionArea,
    Box,
    Typography
} from '@mui/material';

interface ClickableCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: string;
}

export const ClickableCard = ({
    title,
    description,
    icon,
    onClick,
    disabled = false,
    color = '#1976d2' // Default primary blue
}: ClickableCardProps) => {
    return (
        <Card 
            variant="outlined" 
            className={`transition-all duration-200 ease-in-out rounded-2xl overflow-hidden ${
                disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:border-primary'
            }`}
        >
            <CardActionArea 
                onClick={onClick}
                disabled={disabled}
                className="p-6"
            >
                <CardContent className="flex items-center gap-6 p-0">
                    <Box className="relative h-14 w-14 flex items-center justify-center">
                        <Box 
                            className="z-10 h-8 w-8" 
                            sx={{ color: disabled ? 'text.disabled' : color }}
                        >
                            {icon}
                        </Box>
                        <Box 
                            className="absolute rounded-2xl rotate-[30deg] -left-full -top-1/2 w-[250%] h-[250%] opacity-20" 
                            sx={{ backgroundColor: disabled ? '#9e9e9e' : color }} 
                        />
                    </Box>
                    <Box className="flex flex-col ml-8">
                        <Typography 
                            variant="h6" 
                            className="font-semibold mb-1 text-nowrap"
                            color={disabled ? 'text.disabled' : 'text.primary'}
                        >
                            {title}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            className="text-nowrap"
                        >
                            {description}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};