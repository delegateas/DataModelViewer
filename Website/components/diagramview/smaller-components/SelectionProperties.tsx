import { useDiagramView } from "@/contexts/DiagramViewContext";
import { EntityType } from "@/lib/Types";
import {
    Box,
    Button,
    Divider,
    Typography,
    Chip,
    Paper,
    Stack,
    Tooltip
} from "@mui/material";
import {
    AccountTree as GridIcon,
    BubbleChart as ForceIcon
} from "@mui/icons-material";
import { useState } from "react";

interface ISelectionPropertiesProps {
    selectedEntities: EntityType[];
}

export const SelectionProperties = ({ selectedEntities }: ISelectionPropertiesProps) => {
    const { applySmartLayout, getSelectedEntities } = useDiagramView();
    const [isApplying, setIsApplying] = useState(false);

    // Get the current selected entities from the context
    const currentlySelectedEntities = getSelectedEntities();

    // Use the current selection if available, otherwise fall back to the prop
    const entitiesToShow = currentlySelectedEntities.length > 0 ? currentlySelectedEntities : selectedEntities;

    const handleLayout = async (algorithm: 'grid' | 'force') => {
        if (entitiesToShow.length > 0) {
            setIsApplying(true);
            try {
                await applySmartLayout(entitiesToShow, algorithm);
            } finally {
                setIsApplying(false);
            }
        }
    };

    const entityNames = entitiesToShow.map(e => e.SchemaName);
    const displayName = entityNames.length > 3
        ? `${entityNames.slice(0, 3).join(", ")}...`
        : entityNames.join(", ");

    const isDisabled = entitiesToShow.length === 0 || isApplying;

    return (
        <Box className="flex flex-col" gap={2} p={2}>
            {/* Header Section */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Selected Entities
                    </Typography>
                    {entitiesToShow.length > 0 ? (
                        <>
                            <Tooltip title={entityNames.join(", ")} arrow>
                                <Typography variant="body1" fontWeight={500} noWrap>
                                    {displayName}
                                </Typography>
                            </Tooltip>
                            <Chip
                                label={`${entitiesToShow.length} ${entitiesToShow.length === 1 ? 'entity' : 'entities'}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ width: 'fit-content' }}
                            />
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No entities selected
                        </Typography>
                    )}
                </Stack>
            </Paper>

            <Divider />

            {/* Layout Algorithm Section */}
            <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                    Layout Algorithms
                </Typography>

                {/* Grid Hierarchical Layout Button */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: isDisabled ? 'divider' : 'primary.main',
                            bgcolor: isDisabled ? 'inherit' : 'action.hover'
                        }
                    }}
                >
                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <GridIcon color="primary" />
                            <Typography variant="body2" fontWeight={600}>
                                Grid Hierarchical
                            </Typography>
                            <Chip label="Recommended" size="small" color="success" sx={{ ml: 'auto', height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Organizes entities in hierarchical layers with weighted spacing based on relationship density.
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleLayout('grid')}
                            disabled={isDisabled}
                            fullWidth
                        >
                            {isApplying ? 'Applying...' : 'Apply Grid Layout'}
                        </Button>
                    </Stack>
                </Paper>

                {/* Force-Directed Layout Button */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: isDisabled ? 'divider' : 'primary.main',
                            bgcolor: isDisabled ? 'inherit' : 'action.hover'
                        }
                    }}
                >
                    <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ForceIcon color="primary" />
                            <Typography variant="body2" fontWeight={600}>
                                Force-Directed
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Uses physics simulation to minimize edge crossings and distribute entities evenly.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleLayout('force')}
                            disabled={isDisabled}
                            fullWidth
                        >
                            {isApplying ? 'Applying...' : 'Apply Force Layout'}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
};