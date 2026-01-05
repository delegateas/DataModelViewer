import { useDatamodelData } from '@/contexts/DatamodelDataContext'
import { Paper, Typography, Box, Grid, useTheme, Tooltip, IconButton } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { SolutionComponentTypeEnum } from '@/lib/Types'
import { generateEnvelopeSVG } from '@/lib/svgart'
import { InfoIcon } from '@/lib/icons'

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
    const { groups } = useDatamodelData();
    const theme = useTheme();

    const [selectedSolution, setSelectedSolution] = useState<{ Solution1: string, Solution2: string, Components: { Name: string; SchemaName: string; ComponentType: SolutionComponentTypeEnum }[] } | undefined>(undefined);

    const solutions = useMemo(() => {
        const solutionMap: Map<string, { Name: string; SchemaName: string; ComponentType: SolutionComponentTypeEnum }[]> = new Map();
        groups.forEach(group => {
            group.Entities.forEach(entity => {

                if (!entity.Solutions || entity.Solutions.length === 0) {
                    console.log(`Entity ${entity.DisplayName} has no solutions.`);
                }

                entity.Solutions.forEach(solution => {
                    if (!solutionMap.has(solution.Name)) {
                        solutionMap.set(solution.Name, [{ Name: entity.DisplayName, SchemaName: entity.SchemaName, ComponentType: SolutionComponentTypeEnum.Entity }]);
                    } else {
                        solutionMap.get(solution.Name)!.push({ Name: entity.DisplayName, SchemaName: entity.SchemaName, ComponentType: SolutionComponentTypeEnum.Entity });
                    }

                    entity.Attributes.forEach(attribute => {
                        if (!attribute.Solutions || attribute.Solutions.length === 0) {
                            console.log(`Attr ${attribute.DisplayName} has no solutions.`);
                        }

                        attribute.Solutions.forEach(attrSolution => {
                            if (!solutionMap.has(attrSolution.Name)) {
                                solutionMap.set(attrSolution.Name, [{ Name: attribute.DisplayName, SchemaName: attribute.SchemaName, ComponentType: SolutionComponentTypeEnum.Attribute }]);
                            } else {
                                solutionMap.get(attrSolution.Name)!.push({ Name: attribute.DisplayName, SchemaName: attribute.SchemaName, ComponentType: SolutionComponentTypeEnum.Attribute });
                            }
                        });
                    });

                    entity.Relationships.forEach(relationship => {
                        if (!relationship.Solutions || relationship.Solutions.length === 0) {
                            console.log(`Relationship ${relationship.Name} has no solutions.`);
                        }

                        relationship.Solutions.forEach(relSolution => {
                            if (!solutionMap.has(relSolution.Name)) {
                                solutionMap.set(relSolution.Name, [{ Name: relationship.Name, SchemaName: relationship.RelationshipSchema, ComponentType: SolutionComponentTypeEnum.Relationship }]);
                            } else {
                                solutionMap.get(relSolution.Name)!.push({ Name: relationship.Name, SchemaName: relationship.RelationshipSchema, ComponentType: SolutionComponentTypeEnum.Relationship });
                            }
                        });
                    });
                });
            });
        });

        return solutionMap;
    }, [groups]);

    const solutionMatrix = useMemo(() => {
        const solutionNames = Array.from(solutions.keys());

        // Create a cache for symmetric calculations
        const cache = new Map<string, { sharedComponents: { Name: string; SchemaName: string; ComponentType: SolutionComponentTypeEnum }[]; count: number }>();

        const matrix: Array<{
            solution1: string;
            solution2: string;
            sharedComponents: { Name: string; SchemaName: string; ComponentType: SolutionComponentTypeEnum }[];
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
                            components2.some(c2 => c2.SchemaName === c1.SchemaName && c2.ComponentType === c1.ComponentType)
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
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Paper className="p-6 rounded-2xl" elevation={2}>
                    <Typography variant="h6" className="mb-2">
                        Solution Summary
                    </Typography>
                    {selectedSolution ? (
                        <Box className="rounded-lg p-4 flex-grow" sx={{ backgroundColor: "background.default" }}>
                            <Box className="max-h-48 overflow-y-auto">
                                {selectedSolution.Components.length > 0 ? (
                                    <Box>
                                        <Typography variant="body2" className="font-semibold" sx={{ mb: 1 }}>
                                            Shared Components: ({selectedSolution.Components.length})
                                        </Typography>
                                        <ul>
                                            {selectedSolution.Components.map(component => (
                                                <li key={component.SchemaName}>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {component.Name} ({
                                                            component.ComponentType === SolutionComponentTypeEnum.Entity
                                                                ? 'Table'
                                                                : component.ComponentType === SolutionComponentTypeEnum.Attribute
                                                                    ? 'Column'
                                                                    : component.ComponentType === SolutionComponentTypeEnum.Relationship
                                                                        ? 'Relationship'
                                                                        : 'Unknown'
                                                        })
                                                    </Typography>
                                                </li>
                                            ))}
                                        </ul>
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
