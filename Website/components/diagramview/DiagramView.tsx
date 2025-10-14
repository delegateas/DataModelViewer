'use client';

import { useSidebar } from "@/contexts/SidebarContext";
import React, { useEffect } from "react";
import { SidebarDiagramView } from "./SidebarDiagramView";
import DiagramContainer from "./DiagramContainer";
import { DiagramHeaderToolbar } from "./DiagramHeaderToolbar";
import { Box } from "@mui/material";

interface IDiagramViewProps {

}

export default function DiagramView({ }: IDiagramViewProps) {
    const { setElement, expand } = useSidebar();

    useEffect(() => {
        setElement(<SidebarDiagramView />);
        expand();
    }, [])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <DiagramHeaderToolbar />
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <DiagramContainer />
            </Box>
        </Box>
    );
}