import React, { useState, useEffect, useRef } from 'react'
import { Box, Divider, IconButton } from '@mui/material';
import EntityProperties from './smaller-components/EntityProperties';
import { SelectionProperties } from './smaller-components/SelectionProperties';
import { diagramEvents } from '@/lib/diagram/DiagramEventBridge';
import { SelectObjectEvent } from './events/SelectObjectEvent';
import { EntityType } from '@/lib/Types';
import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';
import RelationshipProperties from './smaller-components/RelationshipProperties';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';

interface IPropertiesPanelProps {

}

export default function PropertiesPanel({ }: IPropertiesPanelProps) {
    const [object, setObject] = useState<SelectObjectEvent | null>(null);
    const objectRef = useRef<SelectObjectEvent | null>(null);

    const [isForcedClosed, setIsForcedClosed] = useState<boolean>(false);
    const userClosedRef = useRef<boolean>(false);

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const togglePane = () => {
        if (isForcedClosed) {
            setIsForcedClosed(false);
            setIsOpen(true);
        } else {
            setIsForcedClosed(true);
            setIsOpen(false);
        }
    }

    useEffect(() => {
        userClosedRef.current = isForcedClosed;
    }, [isForcedClosed])

    useEffect(() => {
        objectRef.current = object;
    }, [object]);

    useEffect(() => {
        const cleanup = diagramEvents.onSelectionEvent((event) => {
            if (event.type === 'entity' && objectRef.current?.type === 'selection') {
                return;
            }
            setObject(event);
            setIsOpen(!userClosedRef.current && event.type !== "none");
        });

        return cleanup;
    }, []);

    const getProperties = () => {
        switch (object?.type) {
            case 'entity':
                return <EntityProperties entity={object.data?.[0] as EntityType} closePane={close} />;
            case 'relationship':
                return <RelationshipProperties relationships={object.data as RelationshipInformation[]} linkId={object.objectId} />;
            case 'selection':
                return <SelectionProperties selectedEntities={object.data as EntityType[]} />;
        }
    }

    return (
        <Box className={`h-full transition-all duration-300 absolute right-0 top-0 border-l ${isOpen ? 'w-64' : 'w-4'}`} sx={{ borderColor: 'border.main', backgroundColor: 'background.paper' }}>
            <IconButton
                size='xsmall'
                onClick={togglePane}
                sx={{
                    position: 'absolute',
                    left: '-12px',
                    top: '24px',
                    border: 1,
                    borderColor: 'border.main',
                    bgcolor: 'background.paper',
                    zIndex: 50,
                    '&:hover': {
                        bgcolor: 'background.paper',
                    }
                }}
            >
                {isOpen ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>
            <Divider className='w-full' />
            {
                isOpen && (
                    <Box className='p-4 h-full'>
                        {getProperties()}
                    </Box>
                )
            }
        </Box>
    )
}
