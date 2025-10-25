import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';
import { Box, Paper, Typography } from '@mui/material';
import React from 'react'

interface IRelationshipPropertiesProps {
    relationships: RelationshipInformation[];
}

const RelationshipProperties = ({ relationships }: IRelationshipPropertiesProps) => {
    return (
        <Box className="flex flex-col" gap={2}>
            <Typography variant="h6" className='self-center'>Relationship Properties</Typography>
            {relationships.map((rel, index) => (
                <Paper key={index} className="p-4 flex items-center justify-center overflow-hidden" variant="outlined">
                    <Box className="flex flex-col text-right">
                        <Typography variant='body1'>{rel.sourceEntityDisplayName}</Typography>
                        <Typography variant='caption' className='text-[9px]'>{rel.sourceEntitySchemaName}</Typography>
                    </Box>
                    <Typography variant='h5' className='mx-4 text-nowrap'>{rel.RelationshipType}</Typography>
                    <Box className="flex flex-col text-left">
                        <Typography variant='body1'>{rel.targetEntityDisplayName}</Typography>
                        <Typography variant='caption' className='text-[9px]'>{rel.targetEntitySchemaName}</Typography>
                    </Box>
                </Paper>
            ))}
        </Box>
    )
}

export default RelationshipProperties;