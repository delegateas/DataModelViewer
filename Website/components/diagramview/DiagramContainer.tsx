'use client';

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useDiagramView } from "@/contexts/DiagramViewContext";
import { EntityContextMenu } from "./smaller-components/EntityContextMenu";
import { EntityContextMenuEvent, EntitySelectEvent, DiagramEventDispatcher } from "./events/DiagramEvents";

interface IDiagramContainerProps {

}

export default function DiagramContainer({ }: IDiagramContainerProps) {
    const { canvas, selectEntity } = useDiagramView();
    const [contextMenu, setContextMenu] = useState<{
        open: boolean;
        position: { top: number; left: number } | null;
        entityId?: string;
    }>({
        open: false,
        position: null
    });

    useEffect(() => {
        const handleEntityContextMenu = (evt: EntityContextMenuEvent) => {
            const { entityId, x, y } = evt.detail;
            setContextMenu({
                open: true,
                position: { top: y, left: x },
                entityId: entityId
            });
        };

        const handleEntitySelect = (evt: EntitySelectEvent) => {
            const { entityId, ctrlKey } = evt.detail;
            selectEntity(entityId, ctrlKey);
        };

        DiagramEventDispatcher.addEventListener('entityContextMenu', handleEntityContextMenu);
        DiagramEventDispatcher.addEventListener('entitySelect', handleEntitySelect);

        return () => {
            DiagramEventDispatcher.removeEventListener('entityContextMenu', handleEntityContextMenu);
            DiagramEventDispatcher.removeEventListener('entitySelect', handleEntitySelect);
        };
    }, [selectEntity]);

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
            <EntityContextMenu
                open={contextMenu.open}
                anchorPosition={contextMenu.position}
                onClose={handleCloseContextMenu}
                entityId={contextMenu.entityId}
            />
        </Box>
    );
}
