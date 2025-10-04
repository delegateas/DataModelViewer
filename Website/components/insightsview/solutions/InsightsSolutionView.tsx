import { useDatamodelData } from '@/contexts/DatamodelDataContext'
import { Paper, Typography, Box, Grid, useTheme } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { ResponsiveChord, RibbonDatum } from '@nivo/chord'
import { SolutionComponentType, SolutionComponentTypeEnum } from '@/lib/Types'
import { generateEnvelopeSVG } from '@/lib/svgart'

interface InsightsSolutionViewProps {

}

const InsightsSolutionView = ({ }: InsightsSolutionViewProps) => {
    const { solutions } = useDatamodelData();
    const theme = useTheme();

    const [selectedSolution, setSelectedSolution] = useState<{ sourceSolution: { name: string; color: string }; targetSolution: { name: string; color: string }; sharedComponents: SolutionComponentType[] } | undefined>(undefined);

    const chordData = useMemo(() => {
        if (!solutions || solutions.length === 0) {
            return { matrix: [], keys: [] };
        }

        // Create a mapping of components shared between solutions
        const componentMap = new Map<string, Set<string>>();
        const solutionNames = solutions.map(sol => sol.Name);

        // Track which solutions contain each component
        solutions.forEach(solution => {
            solution.Components.forEach(component => {
                if (!componentMap.has(component.SchemaName)) {
                    componentMap.set(component.SchemaName, new Set());
                }
                componentMap.get(component.SchemaName)!.add(solution.Name);
            });
        });

        // Create matrix showing relationships between solutions based on shared components
        const matrix = solutionNames.map(solutionA => 
            solutionNames.map(solutionB => {
                const solutionAComponents = solutions.find(s => s.Name === solutionA)?.Components || [];
                const solutionBComponents = solutions.find(s => s.Name === solutionB)?.Components || [];
                
                if (solutionA === solutionB) {
                    // For self-reference, return the total number of components in the solution
                    return solutionAComponents.length;
                }
                
                let sharedComponents = 0;
                solutionAComponents.forEach(componentA => {
                    if (solutionBComponents.some(componentB => 
                        componentB.SchemaName === componentA.SchemaName && 
                        componentB.ComponentType === componentA.ComponentType
                    )) {
                        sharedComponents++;
                    }
                });
                
                return sharedComponents;
            })
        );

        return {
            matrix,
            keys: solutionNames
        };
    }, [solutions]);

    const hasData = chordData.keys.length > 0 && 
                   chordData.matrix.some(row => row.some(value => value > 0));

    const onRibbonSelect = ({ source, target }: RibbonDatum) => {
        if (source.id === target.id) return <></>;
        const sourceSolution = chordData.keys[source.index];
        const targetSolution = chordData.keys[target.index];
        
        // Get the actual solutions data for more details
        const sourceSolutionData = solutions?.find(s => s.Name === sourceSolution);
        const targetSolutionData = solutions?.find(s => s.Name === targetSolution);
        
        // Calculate shared components for detailed info
        const sourceComponents = sourceSolutionData?.Components || [];
        const targetComponents = targetSolutionData?.Components || [];

        const sharedComponents = sourceComponents.filter(sourceComp =>
            targetComponents.some(targetComp => 
                targetComp.SchemaName === sourceComp.SchemaName && 
                targetComp.ComponentType === sourceComp.ComponentType
            )
        );

        setSelectedSolution({ sourceSolution: { name: sourceSolution, color: source.color }, targetSolution: { name: targetSolution, color: target.color }, sharedComponents });
    }

    const RibbonTooltip = ({ source, target }: RibbonDatum) => {
        if (source.id === target.id) return <></>;

        const sourceSolution = chordData.keys[source.index];
        const targetSolution = chordData.keys[target.index];
        const sharedCount = chordData.matrix[source.index][target.index];
        
        // Get the actual solutions data for more details
        const sourceSolutionData = solutions?.find(s => s.Name === sourceSolution);
        const targetSolutionData = solutions?.find(s => s.Name === targetSolution);
        
        // Calculate shared components for detailed info
        const sourceComponents = sourceSolutionData?.Components || [];
        const targetComponents = targetSolutionData?.Components || [];
        
        const sharedComponents = sourceComponents.filter(sourceComp =>
            targetComponents.some(targetComp => 
                targetComp.SchemaName === sourceComp.SchemaName && 
                targetComp.ComponentType === sourceComp.ComponentType
            )
        );

        if (!solutions || solutions.length === 0) {
            return (
                <Paper className="p-6 rounded-2xl" elevation={2}>
                    <Typography variant="h4" className="mb-6 font-semibold">
                        Solutions
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No solution data available to analyze component relationships.
                    </Typography>
                </Paper>
            );
        }

        return (
            <Paper className='p-4 rounded-lg shadow-lg w-64' elevation={3} sx={{ 
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {sourceSolution} ↔ {targetSolution}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {sharedCount} shared component{sharedCount !== 1 ? 's' : ''}
                </Typography>
                {sharedComponents.length > 0 && (
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'medium', display: 'block', mb: 1 }}>
                            Shared Components:
                        </Typography>
                        {sharedComponents.slice(0, 5).map((component, index) => (
                            <Typography key={index} variant="caption" sx={{ 
                                display: 'block', 
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                pl: 1
                            }}>
                                • {component.Name} ({component.ComponentType === SolutionComponentTypeEnum.Entity ? 'Entity' : 
                                      component.ComponentType === SolutionComponentTypeEnum.Attribute ? 'Attribute' : 'Relationship'})
                            </Typography>
                        ))}
                        {sharedComponents.length > 5 && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', pl: 1 }}>
                                ... and {sharedComponents.length - 5} more
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>
        );
    };

    return (
        <Grid container spacing={2}>
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
                    <Typography variant="h4" className="mb-6 font-semibold">
                        Solution Relations
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        This chord diagram visualizes shared components between different solutions. 
                        The thickness of connections indicates the number of components shared between solutions.
                    </Typography>
                    
                    {hasData ? (
                        <Box sx={{ height: '400px', width: '100%' }}>
                            <ResponsiveChord
                                data={chordData.matrix}
                                keys={chordData.keys}
                                margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
                                padAngle={0.06}
                                innerRadiusRatio={0.96}
                                innerRadiusOffset={0.02}
                                arcOpacity={1}
                                arcBorderWidth={1}
                                arcBorderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                                arcTooltip={undefined}
                                ribbonOpacity={0.5}
                                ribbonBorderWidth={1}
                                ribbonBorderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                                ribbonTooltip={props => <RibbonTooltip {...props.ribbon} />}
                                onRibbonClick={ribbon => onRibbonSelect(ribbon)}
                                enableLabel={true}
                                label="id"
                                labelOffset={12}
                                labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                                colors={{ scheme: 'category10' }}
                                isInteractive={true}
                                animate={true}
                                motionConfig="gentle"
                                theme={{
                                    text: {
                                        color: "text.primary",
                                        fontSize: 12,
                                        fontWeight: 600
                                    },
                                }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                No shared components found between solutions. 
                                Each solution appears to have unique components.
                            </Typography>
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                <Box className="p-1 w-4 h-4 rounded-md inline-block mr-1" sx={{ backgroundColor: selectedSolution.sourceSolution.color }} />{selectedSolution.sourceSolution.name} -and- <Box className="p-1 w-4 h-4 rounded-md inline-block mr-1" sx={{ backgroundColor: selectedSolution.targetSolution.color }} />{selectedSolution.targetSolution.name}
                            </Typography>
                            <Box className="max-h-48 overflow-y-auto">
                                {selectedSolution.sharedComponents.length > 0 ? (
                                    <Box>
                                        <Typography variant="body2" className="font-semibold" sx={{ mb: 1 }}>
                                            Shared Components: ({selectedSolution.sharedComponents.length})
                                        </Typography>
                                        <ul>
                                            {selectedSolution.sharedComponents.map(component => (
                                                <li key={component.SchemaName}>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {component.Name} ({
                                                            component.ComponentType === SolutionComponentTypeEnum.Entity
                                                                ? 'Entity'
                                                                : component.ComponentType === SolutionComponentTypeEnum.Attribute
                                                                ? 'Attribute'
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
                            Select a connection in the chord diagram to see details about shared components between solutions.
                        </Typography>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default InsightsSolutionView;
