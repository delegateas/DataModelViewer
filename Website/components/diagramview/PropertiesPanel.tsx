import React, { useState, useEffect, useRef } from 'react'
import { Box, Divider, IconButton } from '@mui/material';
import { CloseIcon } from '@/lib/icons';
import EntityProperties from './smaller-components/EntityProperties';
import { SelectionProperties } from './smaller-components/SelectionProperties';
import { diagramEvents } from '@/lib/diagram/DiagramEventBridge';
import { SelectObjectEvent } from './events/SelectObjectEvent';

interface IPropertiesPanelProps {

}

export default function PropertiesPanel({ }: IPropertiesPanelProps) {
    const [object, setObject] = useState<SelectObjectEvent | null>(null);
    const objectRef = useRef<SelectObjectEvent | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const close = () => {
        setIsOpen(false);
        setObject(null);
    };

    useEffect(() => {
        objectRef.current = object;
    }, [object]);

    useEffect(() => {
        const cleanup = diagramEvents.onSelectionEvent((event) => {
            if (event.type === 'entity' && objectRef.current?.type === 'selection') {
                return;
            }
            setObject(event);
            setIsOpen(true);
        });

        return cleanup;
    }, []);

    const getProperties = () => {
        switch (object?.type) {
            case 'entity':
                return <EntityProperties entity={object.data?.[0]} closePane={close} />;
            case 'selection':
                return <SelectionProperties selectedEntities={object.data ?? []} />;
        }
    }

    return (
        <Box className={`h-full transition-all duration-300 absolute right-0 top-0 border-l ${isOpen ? 'w-64' : 'w-0'}`} sx={{ borderColor: 'border.main', backgroundColor: 'background.paper' }}>
            <IconButton className='w-12 h-12 m-1' onClick={close}>{CloseIcon}</IconButton>
            <Divider className='w-full' />
            <Box className='p-4'>
                {getProperties()}
            </Box>
        </Box>
    )
}
