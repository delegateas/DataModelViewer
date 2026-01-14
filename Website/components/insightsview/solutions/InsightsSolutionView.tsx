import { useDatamodelData } from '@/contexts/DatamodelDataContext'
import { Paper, Typography, Box, Grid, useTheme, Tooltip, IconButton, Button, Collapse, FormControlLabel, Checkbox } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { SolutionComponentTypeEnum, SolutionComponentDataType, ComponentTypeCategories, ComponentTypeLabels } from '@/lib/Types'
import { generateEnvelopeSVG } from '@/lib/svgart'
import { InfoIcon } from '@/lib/icons'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

interface InsightsSolutionViewProps {

}

interface HeatMapCell {
    serieId: string;
    data: {
        x: string;
        y: number;
    };
    value: number | null;
}

const InsightsSolutionView = ({ }: InsightsSolutionViewProps) => {
    const { solutionComponents } = useDatamodelData();
    const theme = useTheme();

    // Filter state - default to Entity, Attribute, Relationship for backwards compatibility
    const [enabledComponentTypes, setEnabledComponentTypes] = useState<Set<SolutionComponentTypeEnum>>(
        new Set([
            SolutionComponentTypeEnum.Entity,
            SolutionComponentTypeEnum.Attribute,
            SolutionComponentTypeEnum.Relationship,
        ])
    );

    const [filtersExpanded, setFiltersExpanded] = useState(false);

    const [selectedSolution, setSelectedSolution] = useState<{
        Solution1: string;
        Solution2: string;
        Components: SolutionComponentDataType[];
    } | undefined>(undefined);

    // Handle toggle of individual component type
    const handleToggleType = (type: SolutionComponentTypeEnum, checked: boolean) => {
        setEnabledComponentTypes(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(type);
            } else {
                newSet.delete(type);
            }
            return newSet;
        });
    };

    // Select all component types
    const handleSelectAll = () => {
        const allTypes = Object.values(ComponentTypeCategories).flat();
        setEnabledComponentTypes(new Set(allTypes));
    };

    // Clear all component types
    const handleSelectNone = () => {
        setEnabledComponentTypes(new Set());
    };

    // Build filtered solution map from solutionComponents
    const solutions = useMemo(() => {
        const solutionMap: Map<string, SolutionComponentDataType[]> = new Map();

        solutionComponents.forEach(collection => {
            const filteredComponents = collection.Components.filter(
                comp => enabledComponentTypes.has(comp.ComponentType)
            );
            solutionMap.set(collection.SolutionName, filteredComponents);
        });

        return solutionMap;
    }, [solutionComponents, enabledComponentTypes]);

    const solutionMatrix = useMemo(() => {
        const solutionNames = Array.from(solutions.keys());

        // Create a cache for symmetric calculations
        const cache = new Map<string, { sharedComponents: SolutionComponentDataType[]; count: number }>();

        const matrix: Array<{
            solution1: string;
            solution2: string;
            sharedComponents: SolutionComponentDataType[];
            count: number;
        }> = [];

        for (let i = 0; i < solutionNames.length; i++) {
            for (let j = 0; j < solutionNames.length; j++) {
                const solution1 = solutionNames[i];
                const solution2 = solutionNames[j];

                if (i === j) {
                    matrix.push({
                        solution1,
                        solution2,
                        sharedComponents: [],
                        count: 0
                    });
                } else {
                    // Create a consistent cache key regardless of order
                    const cacheKey = i < j ? `${solution1}|${solution2}` : `${solution2}|${solution1}`;

                    let result = cache.get(cacheKey);

                    if (!result) {
                        // Calculate intersection only once for each pair
                        const components1 = solutions.get(solution1) || [];
                        const components2 = solutions.get(solution2) || [];

                        // Find true intersection: components that exist in BOTH solutions
                        const sharedComponents = components1.filter(c1 =>
                            components2.some(c2 => c2.ObjectId === c1.ObjectId && c2.ComponentType === c1.ComponentType)
                        );

                        result = {
                            sharedComponents,
                            count: sharedComponents.length
                        };

                        cache.set(cacheKey, result);
                    }

                    matrix.push({
                        solution1,
                        solution2,
                        sharedComponents: result.sharedComponents,
                        count: result.count
                    });
                }
            }
        }

        // Transform data for Nivo HeatMap format
        const heatmapData = solutionNames.map((solution1, i) => {
            const dataPoints = solutionNames.map((solution2, j) => {
                const matrixIndex = i * solutionNames.length + j;
                const cell = matrix[matrixIndex];
                return {
                    x: solution2,
                    y: cell.count
                };
            });

            return {
                id: solution1,
                data: dataPoints
            };
        });

        return {
            solutionNames,
            matrix,
            heatmapData
        };
    }, [solutions]);

    // Collapsed state for component groups in summary panel
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Group components by type for summary panel tree view
    const groupedComponents = useMemo(() => {
        if (!selectedSolution) return null;

        const grouped: Record<string, SolutionComponentDataType[]> = {};
        selectedSolution.Components.forEach(comp => {
            const label = ComponentTypeLabels[comp.ComponentType] || 'Unknown';
            if (!grouped[label]) grouped[label] = [];
            grouped[label].push(comp);
        });

        // Sort each group by name
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => a.Name.localeCompare(b.Name));
        });

        return grouped;
    }, [selectedSolution]);

    // Reset collapsed state when selecting a new cell, with smart expand logic
    React.useEffect(() => {
        if (selectedSolution && groupedComponents) {
            const totalComponents = selectedSolution.Components.length;
            if (totalComponents <= 10) {
                // Expand all if small number of components
                setCollapsedGroups(new Set());
            } else {
                // Collapse all by default for larger sets
                setCollapsedGroups(new Set(Object.keys(groupedComponents)));
            }
        }
    }, [selectedSolution?.Solution1, selectedSolution?.Solution2]);

    // Toggle individual group collapse state
    const handleToggleGroup = (label: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    // Expand all groups
    const handleExpandAllGroups = () => {
        setCollapsedGroups(new Set());
    };

    // Collapse all groups
    const handleCollapseAllGroups = () => {
        if (groupedComponents) {
            setCollapsedGroups(new Set(Object.keys(groupedComponents)));
        }
    };

    const onCellSelect = (cellData: HeatMapCell) => {
        const solution1 = cellData.serieId as string;
        const solution2 = cellData.data.x as string;

        if (solution1 === solution2) return;

        // Find the shared components from the matrix
        const i = solutionMatrix.solutionNames.indexOf(solution1);
        const j = solutionMatrix.solutionNames.indexOf(solution2);

        if (i !== -1 && j !== -1) {
            const matrixIndex = i * solutionMatrix.solutionNames.length + j;
            const cell = solutionMatrix.matrix[matrixIndex];

            setSelectedSolution({
                Solution1: solution1,
                Solution2: solution2,
                Components: cell.sharedComponents
            });
        }
    }

    // Get all available component types from the data
    const availableTypes = useMemo(() => {
        const types = new Set<SolutionComponentTypeEnum>();
        solutionComponents.forEach(collection => {
            collection.Components.forEach(comp => {
                types.add(comp.ComponentType);
            });
        });
        return types;
    }, [solutionComponents]);

    return (
        <Grid container spacing={2} className="p-4">
            <Grid size={12}>
                <Box className="px-6 py-8 mb-8 rounded-2xl relative flex justify-center h-full flex-col" sx={{
                    backgroundColor: "background.default",
                    backgroundImage: generateEnvelopeSVG(
                        theme.palette.primary.main,
                    ),
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    color: 'primary.contrastText',
                }}>
                    <Typography variant="h4" className="font-semibold">
                        Solution Insights
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'primary.contrastText', mt: 1, maxWidth: 600 }}>
                        Explore your solutions and their interconnections. Identify shared components and understand how your solutions relate to each other.
                    </Typography>
                </Box>
            </Grid>

            {/* Filter Panel */}
            <Grid size={12}>
                <Paper className="p-4 rounded-2xl" elevation={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" className="font-semibold">
                                Component Type Filters
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                ({enabledComponentTypes.size} selected)
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button size="small" onClick={handleSelectAll}>Select All</Button>
                            <Button size="small" onClick={handleSelectNone}>Clear</Button>
                            <IconButton
                                onClick={() => setFiltersExpanded(!filtersExpanded)}
                                size="small"
                            >
                                {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    <Collapse in={filtersExpanded}>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                {Object.entries(ComponentTypeCategories).map(([category, types]) => {
                                    // Only show categories that have available types
                                    const availableInCategory = types.filter(t => availableTypes.has(t));
                                    if (availableInCategory.length === 0) return null;

                                    return (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={category}>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold' }}>
                                                {category}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                {availableInCategory.map(type => (
                                                    <FormControlLabel
                                                        key={type}
                                                        control={
                                                            <Checkbox
                                                                size="small"
                                                                checked={enabledComponentTypes.has(type)}
                                                                onChange={(e) => handleToggleType(type, e.target.checked)}
                                                            />
                                                        }
                                                        label={
                                                            <Typography variant="body2">
                                                                {ComponentTypeLabels[type]}
                                                            </Typography>
                                                        }
                                                        sx={{ marginY: -0.5 }}
                                                    />
                                                ))}
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    </Collapse>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
                <Paper className="p-6 rounded-2xl" elevation={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h4" className="font-semibold">
                            Solution Relations
                        </Typography>
                        <Tooltip title="This matrix shows shared components between solutions. Each cell displays the count of components shared between the row and column solutions. Cells are color-coded by intensity - darker colors indicate more shared components. Click any cell to view details in the summary panel." arrow placement="left">
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <Box sx={{ width: 20, height: 20 }}>{InfoIcon}</Box>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        Click on any cell to see the shared components between two solutions.
                    </Typography>

                    {solutionMatrix.solutionNames.length === 0 ? (
                        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                No solution data available. Run the Generator to extract solution components.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ height: 600 }}>
                            <ResponsiveHeatMap
                                data={solutionMatrix.heatmapData}
                                margin={{ top: 100, right: 60, bottom: 60, left: 120 }}
                                valueFormat=">-.0f"
                                axisTop={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: -45,
                                    legend: '',
                                    legendOffset: 46,
                                    truncateTickAt: 0
                                }}
                                axisRight={null}
                                axisBottom={null}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                    legend: '',
                                    legendPosition: 'middle',
                                    legendOffset: -40,
                                    truncateTickAt: 0
                                }}
                                colors={{
                                    type: 'sequential',
                                    scheme: 'blues'
                                }}
                                emptyColor={theme.palette.action.disabledBackground}
                                borderColor={{
                                    from: 'color',
                                    modifiers: [['darker', 0.4]]
                                }}
                                labelTextColor={{
                                    from: 'color',
                                    modifiers: [['darker', 2]]
                                }}
                                enableLabels={true}
                                legends={[
                                    {
                                        anchor: 'bottom',
                                        translateX: 0,
                                        translateY: 30,
                                        length: 400,
                                        thickness: 8,
                                        direction: 'row',
                                        tickPosition: 'after',
                                        tickSize: 3,
                                        tickSpacing: 4,
                                        tickOverlap: false,
                                        title: 'Shared Components →',
                                        titleAlign: 'start',
                                        titleOffset: 4
                                    }
                                ]}
                                onClick={(cell: HeatMapCell) => onCellSelect(cell)}
                                hoverTarget="cell"
                                tooltip={({ cell }: { cell: HeatMapCell }) => (
                                    <Box sx={{
                                        background: theme.palette.background.paper,
                                        padding: '9px 12px',
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {cell.serieId} × {cell.data.x}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {cell.serieId === cell.data.x ? 'Same solution' : `${cell.value} shared components`}
                                        </Typography>
                                    </Box>
                                )}
                                theme={{
                                    text: {
                                        fill: theme.palette.text.primary
                                    },
                                    tooltip: {
                                        container: {
                                            background: theme.palette.background.paper,
                                            color: theme.palette.text.primary
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Paper className="p-6 rounded-2xl" elevation={2}>
                    <Typography variant="h6" className="mb-2">
                        Solution Summary
                    </Typography>
                    {selectedSolution ? (
                        <Box className="rounded-lg p-4 flex-grow" sx={{ backgroundColor: "background.default" }}>
                            <Typography variant="body2" className="font-semibold" sx={{ mb: 2 }}>
                                {selectedSolution.Solution1} ∩ {selectedSolution.Solution2}
                            </Typography>
                            <Box className="max-h-96 overflow-y-auto">
                                {selectedSolution.Components.length > 0 && groupedComponents ? (
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {Object.keys(groupedComponents).length} types, {selectedSolution.Components.length} components
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Button size="small" onClick={handleExpandAllGroups} sx={{ minWidth: 'auto', px: 1, py: 0, fontSize: '0.75rem' }}>
                                                    Expand
                                                </Button>
                                                <Button size="small" onClick={handleCollapseAllGroups} sx={{ minWidth: 'auto', px: 1, py: 0, fontSize: '0.75rem' }}>
                                                    Collapse
                                                </Button>
                                            </Box>
                                        </Box>
                                        {Object.entries(groupedComponents)
                                            .sort((a, b) => a[1].length - b[1].length)
                                            .map(([typeLabel, comps]) => (
                                            <Box key={typeLabel} className="mb-1">
                                                <Box
                                                    onClick={() => handleToggleGroup(typeLabel)}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        py: 0.5,
                                                        px: 0.5,
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    {collapsedGroups.has(typeLabel) ? (
                                                        <ExpandMoreIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                    ) : (
                                                        <ExpandLessIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                    )}
                                                    <Typography variant="body2" className="font-semibold" sx={{ color: 'primary.main' }}>
                                                        {typeLabel} ({comps.length})
                                                    </Typography>
                                                </Box>
                                                <Collapse in={!collapsedGroups.has(typeLabel)}>
                                                    <Box component="ul" sx={{ pl: 4, mt: 0.5, mb: 0 }}>
                                                        {comps.map(comp => (
                                                            <li key={comp.ObjectId}>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                    {comp.Name}
                                                                </Typography>
                                                            </li>
                                                        ))}
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        No shared components found.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Typography className="italic" variant="body2" sx={{ color: 'text.secondary' }}>
                            Select a cell in the matrix to see details about shared components between solutions.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default InsightsSolutionView;
