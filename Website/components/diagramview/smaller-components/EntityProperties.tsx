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
        <Box className="flex flex-col" gap={2.5}>
            {/* Entity Header */}
            <Box className="flex flex-col items-center" gap={1.5} sx={{ py: 1 }}>
                {entity.IconBase64 ?
                    <div
                        className="h-10 w-10"
                        style={{
                            maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            backgroundColor: 'currentColor'
                        }}
                    /> : <ExtensionRounded sx={{ fontSize: 40 }} />}
                <Typography variant="h6" className="font-semibold text-center" sx={{ lineHeight: 1.3 }}>
                    {entity?.DisplayName ?? 'Unknown Entity'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    {entity?.SchemaName}
                </Typography>
            </Box>

            <Divider />

            {/* Actions Section */}
            <Box className="flex flex-col" gap={1.5}>
                {hasRelatedEntities && (
                    <Button
                        variant="contained"
                        startIcon={<Box className="w-5 h-5">{PathConnectionIcon}</Box>}
                        onClick={() => setRelatedEntitiesPaneOpen(true)}
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        View Related Entities
                    </Button>
                )}

                <Button
                    variant="outlined"
                    color="error"
                    type="button"
                    startIcon={<Box className="w-5 h-5">{BinIcon}</Box>}
                    onClick={() => { removeEntity(entity.SchemaName); closePane(); }}
                    fullWidth
                    sx={{ textTransform: 'none' }}
                >
                    Remove from Diagram
                </Button>
            </Box>

            {/* Excluded Relationships Section */}
            {excludedRelationships.length > 0 && (
                <>
                    <Divider sx={{ mt: 1 }} />
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Hidden Relationships
                            </Typography>
                            <Chip
                                label={excludedRelationships.length}
                                size="small"
                                color="default"
                                sx={{ height: '20px', fontSize: '11px' }}
                            />
                        </Box>
                        <Box className="flex flex-col" gap={1.5}>
                            {excludedRelationships.map((link, index) => (
                                <Paper
                                    key={index}
                                    className="p-2.5"
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'divider',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'action.selected'
                                        }
                                    }}
                                >
                                    <Box className="flex flex-col" gap={1.5}>
                                        <Typography variant="caption" sx={{ fontSize: '11px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                            {link.sourceSchemaName} ↔ {link.targetSchemaName}
                                        </Typography>
                                        <Box className="flex items-center justify-between">
                                            <Chip
                                                label={`${link.relationshipInformationList.length} link${link.relationshipInformationList.length !== 1 ? 's' : ''}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: '22px', fontSize: '11px' }}
                                            />
                                            <Button
                                                size="small"
                                                startIcon={<RestoreRounded sx={{ fontSize: 16 }} />}
                                                onClick={() => handleRestoreLink(link)}
                                                sx={{ minWidth: 'auto', px: 1, textTransform: 'none', fontSize: '11px' }}
                                            >
                                                Restore
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                </>
            )}

            <RelatedEntitiesPane
                open={relatedEntitiesPaneOpen}
                onClose={() => setRelatedEntitiesPaneOpen(false)}
                entity={entity}
            />
        </Box>
    )
}
