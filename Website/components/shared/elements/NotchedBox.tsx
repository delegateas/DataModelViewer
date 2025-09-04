'use client'

import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface NotchedBoxProps extends Omit<BoxProps, 'component'> {
    notchContent?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

const NotchedBox = ({
    notchContent,
    className,
    children
}: NotchedBoxProps) => {

    const contentRef = React.useRef<HTMLDivElement>(null);

    return (
        <Box className={`flex flex-col w-full ${className || ''}`}>
            <Box className="flex">
                <Box className="rounded-t-2xl flex-grow bg-white" />
                <Box ref={contentRef} className="py-2 mx-4">{notchContent}</Box>
            </Box>
            <Box 
                className="rounded-b-2xl rounded-r-2xl p-8 w-full relative bg-white flex-grow before:transparent 
                    before:content-[''] before:absolute before:-top-8 before:h-8 before:w-4 before:rounded-bl-2xl"
                sx={{
                    '&::before': {
                        boxShadow: `0 8px 0 0 white`,
                        right: `calc(${contentRef.current?.clientWidth || 0}px + 16px)`,
                    }
                }}>
                    {children}
            </Box>
        </Box>
    );
};

export default NotchedBox;
