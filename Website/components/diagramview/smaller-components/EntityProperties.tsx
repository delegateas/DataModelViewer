import { EntityType } from '@/lib/Types';
import { ExtensionRounded, RestoreRounded } from '@mui/icons-material';
import { Box, Divider, Typography, Button, Chip, Paper } from '@mui/material';
import React, { useState, useMemo } from 'react';
import { RelatedEntitiesPane } from '@/components/diagramview/panes/RelatedEntitiesPane';
import { BinIcon, PathConnectionIcon } from '@/lib/icons';
import { useDiagramView, ExcludedLinkMetadata } from '@/contexts/DiagramViewContext';

interface IEntityPropertiesProps {
    entity: EntityType | undefined;
    closePane: () => void;
}

export default function EntityProperties({ entity, closePane }: IEntityPropertiesProps) {
    const [relatedEntitiesPaneOpen, setRelatedEntitiesPaneOpen] = useState(false);
    const { removeEntity, getExcludedLinks, restoreRelationshipLink } = useDiagramView();

    const hasRelatedEntities = (entity?.Relationships ?? []).length > 0 ||
        entity?.Attributes.some(attr => attr.AttributeType === 'LookupAttribute' && attr.Targets.length > 0);

    // Get excluded relationships for this entity
    const excludedRelationships = useMemo(() => {
        const excludedLinks = getExcludedLinks();
        const results: ExcludedLinkMetadata[] = [];

        excludedLinks.forEach((link) => {
            if (link.sourceSchemaName === entity?.SchemaName || link.targetSchemaName === entity?.SchemaName) {
                results.push(link);
            }
        });

        return results;
    }, [entity?.SchemaName, getExcludedLinks]);

    const handleRestoreLink = (link: ExcludedLinkMetadata) => {
        restoreRelationshipLink(link.sourceSchemaName, link.targetSchemaName);
    };

    if (!entity) {
        return (
            <Typography variant="body2">Error: Entity not found.</Typography>
        )
    }

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
            <Typography variant="h6" className="self-center">{entity?.DisplayName ?? 'Unknown Entity'}</Typography>
            <Divider />

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

            {excludedRelationships.length > 0 && (
                <>
                    <Divider />
                    <Typography variant="subtitle2" className="font-semibold">
                        Excluded Relationships
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                        {excludedRelationships.length} hidden relationship{excludedRelationships.length !== 1 ? 's' : ''}
                    </Typography>
                    <Box className="flex flex-col" gap={1}>
                        {excludedRelationships.map((link, index) => (
                            <Paper key={index} className="p-2" variant="outlined" sx={{ borderColor: 'text.disabled' }}>
                                <Box className="flex flex-col" gap={1}>
                                    <Typography variant="caption" className="text-xs">
                                        {link.sourceSchemaName} - {link.targetSchemaName}
                                    </Typography>
                                    <Box className="flex items-center justify-between">
                                        <Chip
                                            label={`${link.relationshipInformationList.length} relationship${link.relationshipInformationList.length !== 1 ? 's' : ''}`}
                                            size="small"
                                            variant="outlined"
                                            className="text-xs h-5"
                                        />
                                        <Button
                                            size="small"
                                            startIcon={<RestoreRounded fontSize="small" />}
                                            onClick={() => handleRestoreLink(link)}
                                            sx={{ minWidth: 'auto', px: 1 }}
                                        >
                                            Restore
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </>
            )}

            <Button
                variant="outlined"
                color="error"
                className="self-end"
                type="button"
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
