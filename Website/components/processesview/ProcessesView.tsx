'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useDatamodelData } from '@/contexts/DatamodelDataContext'
import { Box, Typography, Paper, TextField, InputAdornment, Grid, List, ListItem, ListItemButton, Chip, IconButton, Table, TableHead, TableBody, TableRow, TableCell, useTheme, Alert, Divider, Accordion, AccordionSummary, AccordionDetails, Popper, ClickAwayListener } from '@mui/material'
import { AccountTreeRounded, CloseRounded, ExtensionRounded, JavascriptRounded, SearchRounded, WarningRounded, ExpandMoreRounded } from '@mui/icons-material'
import { AttributeType, EntityType, ComponentType, OperationType, WarningType } from '@/lib/Types'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { StatCard } from '../shared/elements/StatCard'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveBar } from '@nivo/bar'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface IProcessesViewProps { }

interface AttributeSearchResult {
    attribute: AttributeType
    entity: EntityType
    group: string
}

export const ProcessesView = ({ }: IProcessesViewProps) => {
    const { setElement, close } = useSidebar()
    const { groups, warnings } = useDatamodelData()
    const theme = useTheme()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [selectedAttribute, setSelectedAttribute] = useState<AttributeSearchResult | null>(null)
    const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null)
    const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false)
    const initialAttribute = searchParams.get('attr') || "";
    const initialEntity = searchParams.get('ent') || "";

    useEffect(() => {
        setElement(null);
        close();

        if (initialAttribute && initialEntity && groups.length > 0) {
            const d = groups.flatMap(group =>
                group.Entities.flatMap(entity =>
                    entity.Attributes.map(attribute => ({
                        attribute,
                        entity,
                        group: group.Name,
                    }))
                )
            );
            const foundAttribute = d.find(result =>
                result.attribute.SchemaName === initialAttribute
                && result.entity.SchemaName === initialEntity);
            if (foundAttribute) {
                setSelectedAttribute(foundAttribute);
            }
        }
    }, [groups])

    const typeDistribution = useMemo(() => {
        return groups.reduce((acc, group) => {
            group.Entities.forEach(entity => {
                entity.Attributes.forEach(attribute => {
                    attribute.AttributeUsages.forEach(au => {
                        const componentTypeName = au.ComponentType;
                        acc[componentTypeName] = (acc[componentTypeName] || 0) + 1;
                    });
                });
            });
            return acc;
        }, {} as Record<ComponentType, number>);
    }, [groups])

    const chartData = useMemo(() => {
        if (!selectedAttribute) return [];

        const data = Object.values(
            selectedAttribute.attribute.AttributeUsages.reduce((acc, au) => {
                const componentTypeName = ComponentType[au.ComponentType];
                if (acc[componentTypeName]) {
                    acc[componentTypeName].value += 1;
                } else {
                    acc[componentTypeName] = {
                        id: componentTypeName,
                        label: componentTypeName,
                        value: 1
                    };
                }
                return acc;
            }, {} as Record<string, { id: string; label: string; value: number }>)
        );

        return data;
    }, [selectedAttribute])

    const operationTypeData = useMemo(() => {
        if (!selectedAttribute) return [];

        const data = Object.values(
            selectedAttribute.attribute.AttributeUsages.reduce((acc, au) => {
                const operationTypeName = OperationType[au.OperationType];
                if (acc[operationTypeName]) {
                    acc[operationTypeName].count += 1;
                } else {
                    acc[operationTypeName] = {
                        operation: operationTypeName,
                        count: 1,
                        color: 'hsl(210, 70%, 50%)'
                    };
                }
                return acc;
            }, {} as Record<string, { operation: string; count: number; color: string }>)
        );

        return data;
    }, [selectedAttribute])

    // Search through all attributes across all entities
    const searchResults = useMemo(() => {
        if (!searchTerm.trim() || searchTerm.length < 2) {
            return []
        }

        const results: AttributeSearchResult[] = []
        const query = searchTerm.toLowerCase()

        groups.forEach(group => {
            group.Entities.forEach(entity => {
                entity.Attributes.forEach(attribute => {
                    if (attribute.AttributeUsages.length === 0) return; // Only search attributes with usages
                    const basicMatch =
                        attribute.DisplayName.toLowerCase().includes(query) ||
                        attribute.SchemaName.toLowerCase().includes(query) ||
                        (attribute.Description && attribute.Description.toLowerCase().includes(query))

                    // Check options for ChoiceAttribute and StatusAttribute
                    let optionsMatch = false
                    if (attribute.AttributeType === 'ChoiceAttribute' || attribute.AttributeType === 'StatusAttribute') {
                        optionsMatch = attribute.Options.some(option =>
                            option.Name.toLowerCase().includes(query)
                        )
                    }

                    if (basicMatch || optionsMatch) {
                        results.push({
                            attribute,
                            entity,
                            group: group.Name
                        })
                    }
                })
            })
        })

        return results.slice(0, 10) // Limit to 10 results for dropdown
    }, [searchTerm, groups])

    // Simulate search delay for UX
    useEffect(() => {
        if (searchTerm.trim() && searchTerm.length >= 2) {
            setIsSearching(true)
            setShowSearchDropdown(true)
            const timer = setTimeout(() => {
                setIsSearching(false)
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setIsSearching(false)
            setShowSearchDropdown(false)
        }
    }, [searchTerm])

    const handleAttributeSelect = useCallback((result: AttributeSearchResult) => {
        setSelectedAttribute(result);
        setSearchTerm('');
        setShowSearchDropdown(false);

        // Update URL with query params for deeplinking
        const params = new URLSearchParams(searchParams.toString());
        params.set('attr', result.attribute.SchemaName);
        params.set('ent', result.entity.SchemaName);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname])

    const handleClearSelection = useCallback(() => {
        setSelectedAttribute(null);

        // Remove query params
        const params = new URLSearchParams(searchParams.toString());
        params.delete('attr');
        params.delete('ent');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname])

    const getAttributeTypeLabel = (attributeType: string) => {
        switch (attributeType) {
            case 'ChoiceAttribute': return 'Choice'
            case 'DateTimeAttribute': return 'Date Time'
            case 'LookupAttribute': return 'Lookup'
            case 'StringAttribute': return 'Text'
            case 'IntegerAttribute': return 'Number'
            case 'DecimalAttribute': return 'Decimal'
            case 'BooleanAttribute': return 'Yes/No'
            case 'StatusAttribute': return 'Status'
            case 'FileAttribute': return 'File'
            default: return attributeType.replace('Attribute', '')
        }
    }

    const getProcessChip = (componentType: ComponentType) => {
        switch (componentType) {
            case ComponentType.Plugin:
                return <Chip variant="outlined" label="Plugin" color="success" size='small' icon={<ExtensionRounded color='success' />} />;
            case ComponentType.PowerAutomateFlow:
                return <Chip variant="outlined" label="Power Automate" color="info" size='small' icon={<AccountTreeRounded color='info' />} />;
            case ComponentType.WebResource:
                return <Chip variant="outlined" label="Web Resource" color="warning" size='small' icon={<JavascriptRounded color='warning' />} />;
            case ComponentType.ClassicWorkflow:
                return <Chip variant="outlined" label="Classic Workflow" color="primary" size='small' icon={<AccountTreeRounded color='primary' />} />;
            case ComponentType.BusinessRule:
                return <Chip variant="outlined" label="Business Rule" color="secondary" size='small' icon={<AccountTreeRounded color='secondary' />} />;
        }
    }

    return (
        <>
            <LoadingOverlay open={isSearching} message="Searching columns..." />
            <Box className="flex min-h-screen">
                <Box className="flex-1 overflow-auto" sx={{ backgroundColor: 'background.default' }}>
                    <Box className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                        <Grid container spacing={2} className="mb-8">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <StatCard
                                    title="Column process dependencies"
                                    value={typeDistribution[ComponentType.Plugin] || 0}
                                    highlightedWord="Plugin"
                                    tooltipTitle="Includes registered plugin step triggers."
                                    tooltipWarning="Limitations"
                                    imageSrc="/plugin.svg"
                                    imageAlt="Plugin icon"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <StatCard
                                    title="Column process dependencies"
                                    value={typeDistribution[ComponentType.PowerAutomateFlow] || 0}
                                    highlightedWord="Power Automate"
                                    tooltipTitle="Includes CDS Dataverse connector, standard actions and expressions inside other actions."
                                    tooltipWarning="Limitations"
                                    imageSrc="/powerautomate.svg"
                                    imageAlt="Power Automate icon"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <StatCard
                                    title="Column process dependencies"
                                    value={typeDistribution[ComponentType.ClassicWorkflow] || 0}
                                    highlightedWord="Classic Workflow"
                                    imageSrc="/classicalworkflow.svg"
                                    imageAlt="Classic Workflow icon"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StatCard
                                    title="Column process dependencies"
                                    value={typeDistribution[ComponentType.WebResource] || 0}
                                    highlightedWord="Web Resource"
                                    tooltipTitle="Includes getAttribute/getControl, XrmQuery and WebAPI with certain limitation from Web Resource."
                                    tooltipWarning="Limitations"
                                    imageSrc="/webresource.svg"
                                    imageAlt="Web Resource icon"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StatCard
                                    title="Column process dependencies"
                                    value={typeDistribution[ComponentType.BusinessRule] || 0}
                                    highlightedWord="Business Rule"
                                    imageSrc="/businessrule.svg"
                                    imageAlt="Business Rule icon"
                                />
                            </Grid>
                        </Grid>

                        {/* Consolidated Search and Results Paper */}
                        <Paper variant='outlined' className='rounded-2xl mb-8'>
                            <Box className="p-6">
                                {/* Search Bar with Dropdown */}
                                <Box className="mb-4" sx={{ position: 'relative' }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search columns across all tables..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSearchAnchorEl(e.currentTarget);
                                        }}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchRounded className="w-5 h-5" />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'background.default',
                                                '& fieldset': {
                                                    borderColor: 'divider',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                            },
                                        }}
                                    />

                                    {/* Search Dropdown */}
                                    {showSearchDropdown && searchAnchorEl && (
                                        <ClickAwayListener onClickAway={() => setShowSearchDropdown(false)}>
                                            <Paper
                                                elevation={3}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    mt: 1,
                                                    maxHeight: '400px',
                                                    overflowY: 'auto',
                                                    zIndex: 1300,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                {searchResults.length > 0 ? (
                                                    <List disablePadding>
                                                        {searchResults.map((result, index) => (
                                                            <ListItem key={`${result.entity.SchemaName}-${result.attribute.SchemaName}-${index}`} disablePadding>
                                                                <ListItemButton
                                                                    onClick={() => handleAttributeSelect(result)}
                                                                    sx={{
                                                                        py: 1.5,
                                                                        borderBottom: index < searchResults.length - 1 ? 1 : 0,
                                                                        borderColor: 'divider'
                                                                    }}
                                                                >
                                                                    <Box className="flex items-center justify-between w-full gap-2">
                                                                        <Box className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                                            <Box className="flex items-center gap-2">
                                                                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }} noWrap>
                                                                                    {result.attribute.DisplayName}
                                                                                </Typography>
                                                                                <Chip
                                                                                    label={getAttributeTypeLabel(result.attribute.AttributeType)}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{ flexShrink: 0 }}
                                                                                />
                                                                            </Box>
                                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                                                                                {result.attribute.SchemaName}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }} noWrap>
                                                                            {result.entity.DisplayName}
                                                                        </Typography>
                                                                    </Box>
                                                                </ListItemButton>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Box className="p-4 text-center">
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            No columns found matching &quot;{searchTerm}&quot;
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </ClickAwayListener>
                                    )}
                                </Box>

                                {/* Selected Attribute Display */}
                                {selectedAttribute && (
                                    <Box
                                        className="mb-4 p-3 flex items-center justify-between gap-2"
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            borderRadius: 2,
                                            color: 'primary.contrastText'
                                        }}
                                    >
                                        <Box className="flex-1 min-w-0">
                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                Selected Column
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600} noWrap>
                                                {selectedAttribute.attribute.DisplayName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.7 }} noWrap>
                                                {selectedAttribute.attribute.SchemaName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap className='ml-4'>
                                                {selectedAttribute.entity.DisplayName}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSelection}
                                            sx={{
                                                color: 'primary.contrastText',
                                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                                            }}
                                        >
                                            <CloseRounded />
                                        </IconButton>
                                    </Box>
                                )}

                                {/* Process Distribution and Table */}
                                {selectedAttribute && (
                                    <>
                                        <Divider className="mb-4" />

                                        {/* Charts Grid */}
                                        {(chartData.length > 0 || operationTypeData.length > 0) && (
                                            <Grid container spacing={3} className="mb-6">
                                                {/* Process Type Distribution Pie Chart */}
                                                {chartData.length > 0 && (
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box>
                                                            <Typography variant='h6' className="mb-3">Process Type Distribution</Typography>
                                                            <Box sx={{ height: '300px', width: '100%' }}>
                                                                <ResponsivePie
                                                                    data={chartData}
                                                                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                                                                    innerRadius={0.5}
                                                                    padAngle={0.7}
                                                                    cornerRadius={3}
                                                                    activeOuterRadiusOffset={8}
                                                                    borderWidth={1}
                                                                    colors={{ scheme: 'blues' }}
                                                                    borderColor={{
                                                                        from: 'color',
                                                                        modifiers: [['darker', 0.2]]
                                                                    }}
                                                                    arcLinkLabelsSkipAngle={10}
                                                                    arcLinkLabelsTextColor={theme.palette.text.secondary}
                                                                    arcLinkLabelsThickness={2}
                                                                    arcLinkLabelsColor={{ from: 'color' }}
                                                                    arcLabelsSkipAngle={10}
                                                                    arcLabelsTextColor={{
                                                                        from: 'color',
                                                                        modifiers: [['darker', 2]]
                                                                    }}
                                                                    theme={{
                                                                        text: {
                                                                            color: theme.palette.text.primary,
                                                                        },
                                                                        tooltip: {
                                                                            container: {
                                                                                background: theme.palette.background.paper,
                                                                                color: theme.palette.text.primary,
                                                                                border: `1px solid ${theme.palette.divider}`,
                                                                                borderRadius: theme.shape.borderRadius,
                                                                            }
                                                                        }
                                                                    }}
                                                                    legends={[
                                                                        {
                                                                            anchor: 'bottom',
                                                                            direction: 'row',
                                                                            justify: false,
                                                                            translateX: 0,
                                                                            translateY: 56,
                                                                            itemsSpacing: 0,
                                                                            itemWidth: 100,
                                                                            itemHeight: 18,
                                                                            itemTextColor: theme.palette.text.secondary,
                                                                            itemDirection: 'left-to-right',
                                                                            itemOpacity: 1,
                                                                            symbolSize: 12,
                                                                            symbolShape: 'circle'
                                                                        }
                                                                    ]}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Operation Type Distribution Bar Chart */}
                                                {operationTypeData.length > 0 && (
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box>
                                                            <Typography variant='h6' className="mb-3">Operation Type Distribution</Typography>
                                                            <Box sx={{ height: '300px', width: '100%' }}>
                                                                <ResponsiveBar
                                                                    data={operationTypeData}
                                                                    keys={['count']}
                                                                    indexBy="operation"
                                                                    margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                                                                    padding={0.3}
                                                                    innerPadding={2}
                                                                    colors={{ scheme: 'blues' }}
                                                                    borderRadius={4}
                                                                    borderWidth={1}
                                                                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                                                    axisTop={null}
                                                                    axisRight={null}
                                                                    axisBottom={{
                                                                        tickSize: 5,
                                                                        tickPadding: 5,
                                                                        tickRotation: -45
                                                                    }}
                                                                    axisLeft={null}
                                                                    enableGridY={false}
                                                                    enableLabel={true}
                                                                    labelSkipWidth={12}
                                                                    labelSkipHeight={12}
                                                                    labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
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
                                                                    role="application"
                                                                    ariaLabel="Operation type distribution bar chart"
                                                                    barAriaLabel={e => `${e.id}: ${e.formattedValue} in ${e.indexValue}`}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        )}

                                        {/* Process Table */}
                                        <Box>
                                            <Typography variant='h6' className="mb-3">Processes ({selectedAttribute.attribute.AttributeUsages.length})</Typography>
                                            {selectedAttribute.attribute.AttributeUsages.length === 0 ? (
                                                <Box className="p-8 text-center" sx={{ color: 'text.secondary' }}>
                                                    <Typography variant="body2">No process usage data available for this column</Typography>
                                                </Box>
                                            ) : (
                                                <Box
                                                    sx={{
                                                        maxHeight: '500px',
                                                        overflowY: 'auto',
                                                        overflowX: 'auto',
                                                        borderRadius: 2,
                                                        border: 1,
                                                        borderColor: 'divider'
                                                    }}
                                                >
                                                    <Table stickyHeader>
                                                        <TableHead>
                                                            <TableRow sx={{ borderBottom: 2, borderColor: 'divider' }}>
                                                                <TableCell align='center' sx={{ fontWeight: 600, backgroundColor: 'background.paper', borderBottom: 2, borderColor: 'divider' }}>
                                                                    Process
                                                                </TableCell>
                                                                <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper', borderBottom: 2, borderColor: 'divider' }}>
                                                                    Name
                                                                </TableCell>
                                                                <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper', borderBottom: 2, borderColor: 'divider' }}>
                                                                    Type
                                                                </TableCell>
                                                                <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper', borderBottom: 2, borderColor: 'divider' }}>
                                                                    Usage
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {selectedAttribute.attribute.AttributeUsages.map((usage, idx) => (
                                                                <TableRow
                                                                    key={usage.Name + idx}
                                                                    sx={{
                                                                        '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' },
                                                                    }}
                                                                >
                                                                    <TableCell align='center'>
                                                                        {getProcessChip(usage.ComponentType)}
                                                                    </TableCell>
                                                                    <TableCell>{usage.Name}</TableCell>
                                                                    <TableCell>{OperationType[usage.OperationType]}</TableCell>
                                                                    <TableCell>{usage.Usage}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            )}
                                        </Box>
                                    </>
                                )}

                                {!selectedAttribute && (
                                    <Box className="p-8 text-center" sx={{ color: 'text.secondary' }}>
                                        <SearchRounded sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                        <Typography variant="body1">
                                            Search and select a column to view its process dependencies
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                        {/* About This Page */}
                        <Paper variant='outlined' className='rounded-2xl mb-4 p-6'>
                            <Typography variant='h6' className="mb-3">About Process Explorer</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                The Process Explorer helps you understand how columns are used across your Dataverse environment.
                                By standard Microsoft can show some dependencies, but this tool aggregates that data with additional analysis of webresources, cloud flows, and more.
                                Make sure to understand the limitations, as the analysis may not capture 100% of all dependencies.
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                <strong>How to use:</strong> Search for a column by name, then view its process dependencies in the table.
                                You can share specific columns using the URL - the page will automatically load your selected column.
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </>
    )
}