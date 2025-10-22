import { EntityType } from '@/lib/Types';
import { ExtensionRounded } from '@mui/icons-material';
import { Box, Divider, Typography, Button } from '@mui/material';
import React, { useState } from 'react';
import { RelatedEntitiesPane } from '@/components/diagramview/panes/RelatedEntitiesPane';
import { BinIcon, PathConnectionIcon } from '@/lib/icons';
import { useDiagramView } from '@/contexts/DiagramViewContext';

interface IEntityPropertiesProps {
    entity: EntityType | undefined;
    closePane: () => void;
}

export default function EntityProperties({ entity, closePane }: IEntityPropertiesProps) {
    const [relatedEntitiesPaneOpen, setRelatedEntitiesPaneOpen] = useState(false);
    const { removeEntity } = useDiagramView();

    if (!entity) {
        return (
            <Typography variant="body2">Error: Entity not found.</Typography>
        )
    }

    const hasRelatedEntities = entity.Relationships.length > 0 || 
        entity.Attributes.some(attr => attr.AttributeType === 'LookupAttribute' && attr.Targets.length > 0);

    return (
        <Box className="flex flex-col" gap={2}>
            {entity.IconBase64 ? 
                <div 
                    className="h-8 w-8 self-center"
                    style={{
                        maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        backgroundColor: 'currentColor'
                    }}
                /> : <ExtensionRounded />}
            <Typography variant="h6" className='self-center'>{entity?.DisplayName ?? 'Unknown Entity'}</Typography>
            <Divider />
            
            {/* Related Entities Button */}
            {hasRelatedEntities && (
                <Button
                    variant="contained"
                    startIcon={<Box className="w-6 h-6">{PathConnectionIcon}</Box>}
                    onClick={() => setRelatedEntitiesPaneOpen(true)}
                    fullWidth
                >
                    View Related Entities
                </Button>
            )}

            
            <Button
                variant="outlined"
                color='error'
                className='self-end'
                startIcon={<Box className="w-6 h-6">{BinIcon}</Box>}
                onClick={() => { removeEntity(entity.SchemaName); closePane(); }}
                fullWidth
            >
                Remove Entity
            </Button>

            <RelatedEntitiesPane
                open={relatedEntitiesPaneOpen}
                onClose={() => setRelatedEntitiesPaneOpen(false)}
                entity={entity}
            />
        </Box>
    )
}
