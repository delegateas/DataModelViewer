import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';
import { Box, Chip, Paper, Typography } from '@mui/material';
import React from 'react'

interface IRelationshipPropertiesProps {
    relationships: RelationshipInformation[];
}

const RelationshipProperties = ({ relationships }: IRelationshipPropertiesProps) => {
    return (
        <Box className="flex flex-col h-full" gap={2}>
            <Typography variant="h6" className='self-center'>
                Relationship Properties
            </Typography>
            <Typography variant="caption" className='self-center text-gray-500'>
                {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
            </Typography>
            <Box className="overflow-y-auto flex flex-col" gap={2}>
                {relationships.map((rel, index) => (
                <Paper key={index} className="p-3 flex flex-col" variant="outlined">
                    <Box className="flex items-center justify-center mb-2">
                        <Box className="flex flex-col text-right">
                            <Typography variant='body2' className='font-medium'>{rel.sourceEntityDisplayName}</Typography>
                            <Typography variant='caption' className='text-[9px]'>{rel.sourceEntitySchemaName}</Typography>
                        </Box>
                        <Typography variant='h6' className='mx-3 text-nowrap'>{rel.RelationshipType}</Typography>
                        <Box className="flex flex-col text-left">
                            <Typography variant='body2' className='font-medium'>{rel.targetEntityDisplayName}</Typography>
                            <Typography variant='caption' className='text-[9px]'>{rel.targetEntitySchemaName}</Typography>
                        </Box>
                    </Box>

                    {/* Additional relationship details */}
                    <Box className="flex flex-col gap-1 mt-2 pt-2 border-t" sx={{ borderColor: 'divider' }}>
                        {rel.RelationshipName && (
                            <Typography variant='caption' className='text-xs text-wrap break-words'>
                                <span className='font-semibold'>Name:</span> {rel.RelationshipName}
                            </Typography>
                        )}
                        {rel.RelationshipSchemaName && (
                            <Typography variant='caption' className='text-xs text-wrap break-words'>
                                <span className='font-semibold'>Schema:</span> {rel.RelationshipSchemaName}
                            </Typography>
                        )}
                        {rel.LookupAttributeName && (
                            <Typography variant='caption' className='text-xs text-wrap break-words'>
                                <span className='font-semibold'>Lookup Attribute:</span> {rel.LookupAttributeName}
                            </Typography>
                        )}
                        <Box className="flex gap-1 mt-1">
                            {rel.IsLookup && (
                                <Chip label="Lookup" size="small" variant="outlined" className='text-xs h-5' />
                            )}
                            {rel.IsManyToMany && (
                                <Chip label="Many-to-Many" size="small" variant="outlined" className='text-xs h-5' />
                            )}
                        </Box>
                    </Box>
                </Paper>
            ))}
            </Box>
        </Box>
    )
}

export default RelationshipProperties;