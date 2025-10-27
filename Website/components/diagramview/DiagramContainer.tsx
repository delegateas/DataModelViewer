'use client';

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useDiagramView } from "@/contexts/DiagramViewContext";
import { EntityContextMenu } from "./smaller-components/EntityContextMenu";
import PropertiesPanel from "./PropertiesPanel";
import { diagramEvents } from "@/lib/diagram/DiagramEventBridge";

interface IDiagramContainerProps {

}

export default function DiagramContainer({ }: IDiagramContainerProps) {
    const { canvas } = useDiagramView();
    const [contextMenu, setContextMenu] = useState<{
        open: boolean;
        position: { top: number; left: number } | null;
        entityId?: string;
    }>({
        open: false,
        position: null
    });

    // Use the event bridge for diagram events
    useEffect(() => {
        const cleanup = diagramEvents.onContextMenuEvent((entityId, x, y) => {
            setContextMenu({
                open: true,
                position: { top: y, left: x },
                entityId: entityId
            });
        });

        return cleanup;
    }, []);

    const handleCloseContextMenu = () => {
        setContextMenu({
            open: false,
            position: null
        });
    };

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
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
            <EntityContextMenu
                open={contextMenu.open}
                anchorPosition={contextMenu.position}
                onClose={handleCloseContextMenu}
                entityId={contextMenu.entityId}
            />
            <PropertiesPanel />
        </Box>
    );
}
