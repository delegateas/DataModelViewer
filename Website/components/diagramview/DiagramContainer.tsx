'use client';

import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useDiagramView } from "@/contexts/DiagramViewContext";

interface IDiagramContainerProps {

}

export default function DiagramContainer({ }: IDiagramContainerProps) {
    
    const { canvas } = useDiagramView();

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div 
                ref={canvas} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    minHeight: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                }} 
            />
        </Box>
    );
}
