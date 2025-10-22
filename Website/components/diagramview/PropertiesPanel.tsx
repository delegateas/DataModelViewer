import React, { useEffect, useState } from 'react'
import { SelectObjectEvent } from './events/SelectObjectEvent';
import { Box, Divider, IconButton } from '@mui/material';
import { CloseIcon } from '@/lib/icons';
import EntityProperties from './smaller-components/EntityProperties';

interface IPropertiesPanelProps {

}

export default function PropertiesPanel({ }: IPropertiesPanelProps) {
    const [object, setObject] = useState<SelectObjectEvent | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const close = () => {
        setIsOpen(false);
        setObject(null);
    }

    useEffect(() => {
        const handleObjectSelection = (evt: CustomEvent<SelectObjectEvent>) => {
            console.log("Object selected:", evt.detail);
            setObject(evt.detail);
            setIsOpen(true);
        };
        window.addEventListener('selectObject', handleObjectSelection as EventListener);
        return () => {
            window.removeEventListener('selectObject', handleObjectSelection as EventListener);
        };
    }, []);

    const getProperties = () => {
        switch (object?.type) {
            case 'entity':
                return <EntityProperties entity={object.data} />;
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
