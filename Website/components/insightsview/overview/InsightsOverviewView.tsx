import { InfoCard } from "@/components/shared/elements/InfoCard";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { ComponentIcon, InfoIcon, ProcessesIcon, SolutionIcon, WarningIcon } from "@/lib/icons";
import { generateLiquidCheeseSVG } from "@/lib/svgart";
import { Box, Grid, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { useMemo } from "react";

interface InsightsOverviewViewProps {

}

const InsightsOverviewView = ({ }: InsightsOverviewViewProps) => {
    const theme = useTheme();

    const { groups, solutions } = useDatamodelData();

    const totalAttributeUsageCount = useMemo(() => {
        return groups.reduce((acc, group) => acc + group.Entities.reduce((acc, entity) => acc + entity.Attributes.reduce((acc, attr) => acc + attr.AttributeUsages.length, 0), 0), 0);
    }, [groups])

    const missingIconEntities = useMemo(() => {
        const iconsMissing = groups.flatMap(group => group.Entities.filter(entity => !entity.IconBase64));
        return iconsMissing;
    }, [groups]);

    const ungroupedEntities = useMemo(() => {
        const ungrouped = groups.find(g => g.Name.toLowerCase() === "ungrouped");
        return ungrouped ? ungrouped.Entities : [];
    }, [groups]);

    const barChartData = useMemo(() => {
        // Get all entities from all groups
        const allEntities = groups.flatMap(group => group.Entities);

        // Count entities
        const standardEntities = allEntities.filter(entity => !entity.IsCustom);
        const customEntities = allEntities.filter(entity => entity.IsCustom);

        // Count attributes
        const allAttributes = allEntities.flatMap(entity => entity.Attributes);
        const standardAttributes = allAttributes.filter(attr => !attr.IsCustomAttribute);
        const customAttributes = allAttributes.filter(attr => attr.IsCustomAttribute);

        // Count relationships
        const allRelationships = allEntities.flatMap(entity => entity.Relationships);
        const standardRelationships = allRelationships.filter(rel => !rel.IsCustom);
        const customRelationships = allRelationships.filter(rel => rel.IsCustom);

        return [
            {
                category: 'Entities',
                standard: standardEntities.length,
                custom: customEntities.length,
            },
            {
                category: 'Attributes',
                standard: standardAttributes.length,
                custom: customAttributes.length,
            },
            {
                category: 'Relationships',
                standard: standardRelationships.length,
                custom: customRelationships.length,
            }
        ];
    }, [groups]);

    const entityFeaturesData = useMemo(() => {
        const allEntities = groups.flatMap(group => group.Entities);

        const auditEnabled = allEntities.filter(entity => entity.IsAuditEnabled).length;
        const auditDisabled = allEntities.filter(entity => !entity.IsAuditEnabled).length;
        const activities = allEntities.filter(entity => entity.IsActivity).length;
        const notesEnabled = allEntities.filter(entity => entity.IsNotesEnabled).length;
        const notesDisabled = allEntities.filter(entity => !entity.IsNotesEnabled).length;

        return [
            { id: 'Audit Enabled', label: 'Audit Enabled', value: auditEnabled },
            { id: 'Audit Disabled', label: 'Audit Disabled', value: auditDisabled },
            { id: 'Activities', label: 'Activities', value: activities },
            { id: 'Notes Enabled', label: 'Notes Enabled', value: notesEnabled },
            { id: 'Notes Disabled', label: 'Notes Disabled', value: notesDisabled },
        ].filter(item => item.value > 0); // Only show categories with values
    }, [groups]);

    const attributeTypeData = useMemo(() => {
        const allEntities = groups.flatMap(group => group.Entities);
        const allAttributes = allEntities.flatMap(entity => entity.Attributes);

        // Count attribute types
        const attributeTypeCounts = allAttributes.reduce((acc, attr) => {
            const type = attr.AttributeType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(attributeTypeCounts).map(([type, count]) => ({
            id: type.replace('Attribute', ''),
            label: type.replace('Attribute', ''),
            value: count
        }));
    }, [groups]);

    const publisherComponentData = useMemo(() => {
        // Count components per publisher by looking at each component's publisher
        const publisherCounts: Record<string, number> = {};

        solutions.forEach(solution => {
            solution.Components.forEach(component => {
                const publisher = component.PublisherName;
                if (!publisherCounts[publisher]) {
                    publisherCounts[publisher] = 0;
                }
                publisherCounts[publisher]++;
            });
        });

        // Convert to chart format and sort by component count (descending)
        return Object.entries(publisherCounts)
            .map(([publisher, count]) => ({
                publisher: publisher,
                components: count
            }))
            .sort((a, b) => b.components - a.components);
    }, [solutions]);

    const attributeUsageByComponentType = useMemo(() => {
        const allEntities = groups.flatMap(group => group.Entities);
        const allAttributeUsages = allEntities.flatMap(entity =>
            entity.Attributes.flatMap(attr => attr.AttributeUsages)
        );

        // Count by component type
        const componentTypeCounts: Record<number, number> = {};
        allAttributeUsages.forEach(usage => {
            componentTypeCounts[usage.ComponentType] = (componentTypeCounts[usage.ComponentType] || 0) + 1;
        });

        // Map component type numbers to labels
        const componentTypeLabels: Record<number, string> = {
            0: 'Power Automate Flow',
            1: 'Plugin',
            2: 'Web Resource',
            3: 'Workflow Activity',
            4: 'Custom API',
            5: 'Business Rule',
            6: 'Classic Workflow'
        };

        return Object.entries(componentTypeCounts).map(([type, count]) => ({
            id: componentTypeLabels[parseInt(type)] || `Type ${type}`,
            label: componentTypeLabels[parseInt(type)] || `Type ${type}`,
            value: count
        }));
    }, [groups]);

    const attributeUsageBySource = useMemo(() => {
        const allEntities = groups.flatMap(group => group.Entities);
        const allAttributeUsages = allEntities.flatMap(entity =>
            entity.Attributes.flatMap(attr => attr.AttributeUsages)
        );

        const analyzerDetected = allAttributeUsages.filter(usage => !usage.IsFromDependencyAnalysis).length;
        const dependencyDetected = allAttributeUsages.filter(usage => usage.IsFromDependencyAnalysis).length;

        return [
            { id: 'Analyzer Detected', label: 'Analyzer Detected', value: analyzerDetected },
            { id: 'Dependency Detected', label: 'Dependency Detected', value: dependencyDetected }
        ].filter(item => item.value > 0);
    }, [groups]);

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
                <Box className="px-6 py-8 mb-8 rounded-2xl relative flex items-center h-full" sx={{
                    backgroundColor: "background.default",
                    backgroundImage: generateLiquidCheeseSVG(
                        theme.palette.primary.main,
                    ),
                    backgroundSize: "cover",
                    color: 'primary.contrastText',
                }}>
                    <Stack direction="column" spacing={2} justifyContent="center">
                        <Typography
                            variant="h3"
                            className="font-bold"
                            sx={{
                                textShadow: theme.palette.mode === 'light'
                                    ? '0 1px 3px rgba(0,0,0,0.3)'
                                    : 'none'
                            }}
                        >
                            Insights
                        </Typography>
                        <Typography
                            variant='body2'
                            sx={{
                                textShadow: theme.palette.mode === 'light'
                                    ? '0 1px 2px rgba(0,0,0,0.2)'
                                    : 'none'
                            }}
                        >
                            All your insights in one place. Keep track of your data model&apos;s health and status.<br />Stay informed about any potential issues or areas for improvement.
                        </Typography>
                    </Stack>
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
                <Paper elevation={0} className="p-4 flex rounded-2xl">
                    <Stack className="w-full" direction="column" spacing={2} alignItems="center" justifyContent="center">
                        {/* Ungrouped Entities */}
                        <Tooltip title={"Entities: " + ungroupedEntities.map(entity => entity.SchemaName).join(", ")}>
                            <Box className="text-center px-4 py-1 rounded-lg flex items-center w-full" gap={2} sx={{ backgroundColor: 'background.default' }}>
                                <Box className="h-8 w-8" sx={{ color: 'error.main' }}>{WarningIcon}</Box>
                                <Typography variant="h4" className="font-semibold p-0 m-0" sx={{ color: 'text.primary' }}>{ungroupedEntities.length}</Typography>
                                <Typography variant="body2" className="p-0 m-0" sx={{ color: 'text.secondary' }}>Entities ungrouped</Typography>
                            </Box>
                        </Tooltip>

                        {/* No Icon Entities */}
                        <Tooltip title={"Entities: " + missingIconEntities.map(entity => entity.SchemaName).join(", ")}>
                            <Box className="text-center px-4 py-1 rounded-lg flex items-center w-full" gap={2} sx={{ backgroundColor: 'background.default' }}>
                                <Box className="h-8 w-8" sx={{ color: 'error.main' }}>{WarningIcon}</Box>
                                <Typography variant="h4" className="font-semibold p-0 m-0" sx={{ color: 'text.primary' }}>{missingIconEntities.length}</Typography>
                                <Typography variant="body2" className="p-0 m-0" sx={{ color: 'text.secondary' }}>Entities without icons</Typography>
                            </Box>
                        </Tooltip>

                        {/* No Icon Entities */}
                        <Tooltip title="">
                            <Box className="text-center px-4 py-1 rounded-lg flex items-center w-full" gap={2} sx={{ backgroundColor: 'background.default' }}>
                                <Box className="h-8 w-8" sx={{ color: 'text.disabled' }}>{InfoIcon}</Box>
                                <Typography variant="h4" className="font-semibold p-0 m-0" sx={{ color: 'text.disabled' }}>0</Typography>
                                <Typography variant="body2" className="p-0 m-0 italic" sx={{ color: 'text.disabled' }}>More coming soon</Typography>
                            </Box>
                        </Tooltip>
                    </Stack>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <InfoCard
                    color="success.main"
                    title="Solutions"
                    value={solutions.length}
                    iconSrc={SolutionIcon}
                />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <InfoCard
                    color="primary.main"
                    title="Components"
                    value={solutions.reduce((acc, solution) => acc + solution.Components.length, 0)}
                    iconSrc={ComponentIcon}
                />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <InfoCard
                    color="warning.main"
                    title="Attribute Process Dependencies"
                    value={totalAttributeUsageCount}
                    iconSrc={ProcessesIcon}
                />
            </Grid>

            <Grid size={12}>
                <Paper elevation={2} className="p-6 rounded-2xl">
                    <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                        Data Model Distribution: Standard vs Custom
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveBar
                            data={barChartData}
                            keys={['standard', 'custom']}
                            indexBy="category"
                            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                            padding={0.3}
                            innerPadding={2}
                            groupMode="grouped"
                            layout="vertical"
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={{ scheme: "blues" }}
                            borderRadius={4}
                            borderWidth={1}
                            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                            axisTop={null}
                            axisRight={null}
                            enableLabel={true}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
                            legends={[
                                {
                                    dataFrom: 'keys',
                                    anchor: 'bottom-right',
                                    direction: 'column',
                                    justify: false,
                                    translateX: 120,
                                    translateY: 0,
                                    itemsSpacing: 2,
                                    itemWidth: 100,
                                    itemHeight: 20,
                                    itemDirection: 'left-to-right',
                                    itemOpacity: 0.85,
                                    symbolSize: 20,
                                    effects: [
                                        {
                                            on: 'hover',
                                            style: {
                                                itemOpacity: 1
                                            }
                                        }
                                    ]
                                }
                            ]}
                            role="application"
                            ariaLabel="Data model distribution bar chart"
                            barAriaLabel={e => `${e.id}: ${e.formattedValue} in category: ${e.indexValue}`}
                            theme={{
                                background: 'transparent',
                                text: {
                                    fontSize: 12,
                                    fill: theme.palette.text.primary,
                                    outlineWidth: 0,
                                    outlineColor: 'transparent'
                                },
                                axis: {
                                    domain: {
                                        line: {
                                            stroke: theme.palette.divider,
                                            strokeWidth: 1
                                        }
                                    },
                                    legend: {
                                        text: {
                                            fontSize: 12,
                                            fill: theme.palette.text.primary
                                        }
                                    },
                                    ticks: {
                                        line: {
                                            stroke: theme.palette.divider,
                                            strokeWidth: 1
                                        },
                                        text: {
                                            fontSize: 11,
                                            fill: theme.palette.text.primary
                                        }
                                    }
                                },
                                grid: {
                                    line: {
                                        stroke: theme.palette.divider,
                                        strokeWidth: 1,
                                        strokeDasharray: '4 4'
                                    }
                                },
                                legends: {
                                    title: {
                                        text: {
                                            fontSize: 11,
                                            fill: theme.palette.text.primary
                                        }
                                    },
                                    text: {
                                        fontSize: 11,
                                        fill: theme.palette.text.primary
                                    },
                                    ticks: {
                                        line: {},
                                        text: {
                                            fontSize: 10,
                                            fill: theme.palette.text.primary
                                        }
                                    }
                                },
                                annotations: {
                                    text: {
                                        fontSize: 13,
                                        fill: theme.palette.text.primary,
                                        outlineWidth: 2,
                                        outlineColor: theme.palette.background.default,
                                        outlineOpacity: 1
                                    },
                                    link: {
                                        stroke: theme.palette.text.primary,
                                        strokeWidth: 1,
                                        outlineWidth: 2,
                                        outlineColor: theme.palette.background.default,
                                        outlineOpacity: 1
                                    },
                                    outline: {
                                        stroke: theme.palette.text.primary,
                                        strokeWidth: 2,
                                        outlineWidth: 2,
                                        outlineColor: theme.palette.background.default,
                                        outlineOpacity: 1
                                    },
                                    symbol: {
                                        fill: theme.palette.text.primary,
                                        outlineWidth: 2,
                                        outlineColor: theme.palette.background.default,
                                        outlineOpacity: 1
                                    }
                                },
                                tooltip: {
                                    container: {
                                        background: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                    }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            <Grid size={12}>
                <Paper elevation={2} className="p-6 rounded-2xl">
                    <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                        Components by Publisher
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveBar
                            data={publisherComponentData}
                            keys={['components']}
                            indexBy="publisher"
                            margin={{ top: 50, right: 50, bottom: 80, left: 150 }}
                            padding={0.3}
                            layout="horizontal"
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={{ scheme: "blues" }}
                            borderRadius={4}
                            borderWidth={1}
                            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'Number of Components',
                                legendPosition: 'middle',
                                legendOffset: 40
                            }}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'Publisher',
                                legendPosition: 'middle',
                                legendOffset: -140
                            }}
                            enableLabel={true}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
                            role="application"
                            ariaLabel="Components by publisher bar chart"
                            barAriaLabel={e => `${e.indexValue}: ${e.formattedValue} components`}
                            theme={{
                                background: 'transparent',
                                text: {
                                    fontSize: 12,
                                    fill: theme.palette.text.primary,
                                    outlineWidth: 0,
                                    outlineColor: 'transparent'
                                },
                                axis: {
                                    domain: {
                                        line: {
                                            stroke: theme.palette.divider,
                                            strokeWidth: 1
                                        }
                                    },
                                    legend: {
                                        text: {
                                            fontSize: 12,
                                            fill: theme.palette.text.primary
                                        }
                                    },
                                    ticks: {
                                        line: {
                                            stroke: theme.palette.divider,
                                            strokeWidth: 1
                                        },
                                        text: {
                                            fontSize: 11,
                                            fill: theme.palette.text.primary
                                        }
                                    }
                                },
                                grid: {
                                    line: {
                                        stroke: theme.palette.divider,
                                        strokeWidth: 1,
                                        strokeDasharray: '4 4'
                                    }
                                },
                                tooltip: {
                                    container: {
                                        background: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                    }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <Paper elevation={2} className="p-6 rounded-2xl">
                    <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                        Entity Features Distribution
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsivePie
                            data={entityFeaturesData}
                            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                            innerRadius={0.5}
                            padAngle={0.7}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            colors={{ scheme: "blues" }}
                            borderWidth={1}
                            borderColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 0.2]
                                ]
                            }}
                            arcLinkLabelsTextColor={theme.palette.text.primary}
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor={{ from: 'color' }}
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 2]
                                ]
                            }}
                            theme={{
                                background: 'transparent',
                                text: {
                                    fontSize: 12,
                                    fill: theme.palette.text.primary,
                                },
                                tooltip: {
                                    container: {
                                        background: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                    }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <Paper elevation={2} className="p-6 rounded-2xl">
                    <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                        Attribute Types Distribution
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsivePie
                            data={attributeTypeData}
                            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                            innerRadius={0.5}
                            padAngle={0.7}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            colors={{ scheme: "blues" }}
                            borderWidth={1}
                            borderColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 0.2]
                                ]
                            }}
                            arcLinkLabelsTextColor={theme.palette.text.primary}
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor={{ from: 'color' }}
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 2]
                                ]
                            }}
                            theme={{
                                background: 'transparent',
                                text: {
                                    fontSize: 12,
                                    fill: theme.palette.text.primary,
                                },
                                tooltip: {
                                    container: {
                                        background: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                    }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <Paper elevation={2} className="p-6 rounded-2xl">
                    <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                        Attribute Process Dependencies by Type
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsivePie
                            data={attributeUsageByComponentType}
                            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                            innerRadius={0.5}
                            padAngle={0.7}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            colors={{ scheme: "category10" }}
                            borderWidth={1}
                            borderColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 0.2]
                                ]
                            }}
                            arcLinkLabelsTextColor={theme.palette.text.primary}
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor={{ from: 'color' }}
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 2]
                                ]
                            }}
                            theme={{
                                background: 'transparent',
                                text: {
                                    fontSize: 12,
                                    fill: theme.palette.text.primary,
                                },
                                tooltip: {
                                    container: {
                                        background: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                    }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <Paper elevation={2} className="p-6 rounded-2xl">
                    <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                        Attribute Process Dependencies by Detection Source
                    </Typography>
                    <Box sx={{ height: 400 }}>
                        <ResponsivePie
                            data={attributeUsageBySource}
                            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                            innerRadius={0.5}
                            padAngle={0.7}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            colors={{ scheme: "set2" }}
                            borderWidth={1}
                            borderColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 0.2]
                                ]
                            }}
                            arcLinkLabelsTextColor={theme.palette.text.primary}
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor={{ from: 'color' }}
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{
                                from: 'color',
                                modifiers: [
                                    ['darker', 2]
                                ]
                            }}
                            theme={{
                                background: 'transparent',
                                text: {
                                    fontSize: 12,
                                    fill: theme.palette.text.primary,
                                },
                                tooltip: {
                                    container: {
                                        background: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                    }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default InsightsOverviewView;