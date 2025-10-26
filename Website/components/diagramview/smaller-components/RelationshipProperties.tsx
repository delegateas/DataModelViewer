import { useDiagramView } from '@/contexts/DiagramViewContext';
import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';
import { Box, Chip, Paper, Typography, FormControlLabel, Switch } from '@mui/material';
import React, { useState } from 'react'

interface IRelationshipPropertiesProps {
    relationships: RelationshipInformation[];
    linkId?: string;
}

const RelationshipProperties = ({ relationships, linkId }: IRelationshipPropertiesProps) => {

    const { toggleRelationshipLink } = useDiagramView();
    const [isToggled, setIsToggled] = useState<Map<number, boolean | undefined>>(relationships.reduce((map, rel, index) => {
        map.set(index, rel.isIncluded);
        return map;
    }, new Map<number, boolean | undefined>()));

    const handleToggleInclude = (index: number, currentValue: boolean | undefined) => {
        if (!linkId) return;
        toggleRelationshipLink(linkId, relationships[index].RelationshipSchemaName, !currentValue);
        setIsToggled((prev) => new Map(prev).set(index, !currentValue));
    };

    return (
        <Box className="flex flex-col h-full" gap={2}>
            <Typography variant="h6" className='self-center'>
                Relationship Properties
            </Typography>
            <Typography variant="caption" className='self-center text-gray-500'>
                {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
            </Typography>
            <Box className="overflow-y-auto flex flex-col" gap={2}>
                {relationships.map((rel, index) => {

                    return (
                        <Paper key={index} className="p-3 flex flex-col" variant="outlined" sx={{
                            opacity: isToggled ? 1 : 0.6,
                            borderColor: isToggled ? 'divider' : 'text.disabled'
                        }}>
                            <Box className="flex items-center justify-between mb-2">
                                <Box className="flex items-center flex-1 justify-center">
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
                            </Box>

                            {/* Additional relationship details */}
                            <Box className="flex flex-col gap-1 mt-2 pt-2 border-t" sx={{ borderColor: 'divider' }}>
                                {rel.RelationshipSchemaName && (
                                    <Typography variant='caption' className='text-xs text-wrap break-words'>
                                        <span className='font-semibold'>Schema:</span> {rel.RelationshipSchemaName}
                                    </Typography>
                                )}
                                <Box className="flex gap-1 mt-1 items-center justify-between">
                                    <Box className="flex gap-1">
                                        {rel.IsManyToMany && (
                                            <Chip label="Many-to-Many" size="small" variant="outlined" className='text-xs h-5' />
                                        )}
                                        {rel.isIncluded === undefined && (
                                            <Chip label="New" size="small" variant="outlined" className='text-xs h-5' />
                                        )}
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={isToggled.get(index) ?? true}
                                                onChange={() => handleToggleInclude(index, isToggled.get(index))}
                                            />
                                        }
                                        label={<Typography variant="caption">{isToggled.get(index) ? 'Included' : 'Excluded'}</Typography>}
                                        className='ml-auto'
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    )
}

export default RelationshipProperties;