'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useDatamodelData } from '@/contexts/DatamodelDataContext'
import { Box, Typography, Paper, TextField, InputAdornment, Grid, List, ListItem, ListItemButton, ListItemText, Chip, IconButton, Table, TableHead, TableBody, TableRow, TableCell, useTheme, Alert, Tooltip, Divider } from '@mui/material'
import { AccountTreeRounded, AddAlertRounded, CloseRounded, ExtensionRounded, JavascriptRounded, SearchRounded, WarningRounded } from '@mui/icons-material'
import { AttributeType, EntityType, ComponentType, OperationType, WarningType } from '@/lib/Types'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import NotchedBox from '../shared/elements/NotchedBox'
import { StatCard } from '../shared/elements/StatCard'
import { ResponsivePie } from '@nivo/pie'

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
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [selectedAttribute, setSelectedAttribute] = useState<AttributeSearchResult | null>(null)

    useEffect(() => {
        setElement(null);
        close();
    }, [setElement, close])

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
        }, { } as Record<ComponentType, number>);
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

        return results.slice(0, 50) // Limit results for performance
    }, [searchTerm, groups])

    // Simulate search delay for UX
    useEffect(() => {
        if (searchTerm.trim() && searchTerm.length >= 2) {
        setIsSearching(true)
        const timer = setTimeout(() => {
            setIsSearching(false)
        }, 300)
        return () => clearTimeout(timer)
        } else {
        setIsSearching(false)
        }
    }, [searchTerm])

    const handleAttributeSelect = useCallback((result: AttributeSearchResult) => {
        setSelectedAttribute(result);
        setSearchTerm('');
    }, [])

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
        }
    }

    return (
        <>
            <LoadingOverlay open={isSearching} message="Searching attributes..." />
            <Box className="flex min-h-screen">
                <Box className="flex-1 overflow-auto" sx={{ backgroundColor: 'background.default' }}>
                <Box className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                    <Grid container spacing={2} className="mb-8">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <StatCard
                                title="attribute usages"
                                value={typeDistribution[ComponentType.Plugin] || 0}
                                highlightedWord="Plugin"
                                tooltipTitle="Only includes registered plugin step triggers."
                                tooltipWarning="Limitations"
                                imageSrc="/plugin.svg"
                                imageAlt="Plugin icon"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <StatCard
                                title="attribute usages"
                                value={typeDistribution[ComponentType.PowerAutomateFlow] || 0}
                                highlightedWord="Power Automate"
                                tooltipTitle="Only includes CDS Actions."
                                tooltipWarning="Limitations"
                                imageSrc="/powerautomate.svg"
                                imageAlt="Power Automate icon"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <StatCard
                                title="attribute usages"
                                value={typeDistribution[ComponentType.WebResource] || 0}
                                highlightedWord="Web Resource"
                                tooltipTitle="Only includes getAttribute from Web Resource."
                                tooltipWarning="Limitations"
                                imageSrc="/webresource.svg"
                                imageAlt="Web Resource icon"
                            />
                        </Grid>
                    </Grid>

                    {/* Search Bar */}
                    <Box className="mb-8">
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search attributes across all entities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            backgroundColor: 'background.paper',
                            borderRadius: '8px',
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
                        '& .MuiInputBase-input': {
                            fontSize: '1.1rem',
                            padding: '14px 16px',
                        },
                        }}
                    />
                    </Box>

                    {/* Search Results */}
                    {searchTerm.trim() && searchTerm.length >= 2 && !isSearching && (
                    <Box className="mb-8">
                        <Typography variant="h6" className="mb-4" sx={{ color: 'text.primary' }}>
                            Attribute Search Results ({searchResults.length})
                        </Typography>
                        
                        {searchResults.length > 0 ? (
                            <Paper 
                                elevation={1}
                                sx={{ 
                                borderRadius: 2,
                                backgroundColor: 'background.paper',
                                maxHeight: '400px',
                                overflow: 'auto'
                            }}
                        >
                            <List>
                            {searchResults.map((result, index) => (
                                <ListItem key={`${result.entity.SchemaName}-${result.attribute.SchemaName}-${index}`} disablePadding>
                                <ListItemButton 
                                    onClick={() => handleAttributeSelect(result)}
                                    selected={selectedAttribute?.attribute.SchemaName === result.attribute.SchemaName && 
                                            selectedAttribute?.entity.SchemaName === result.entity.SchemaName}
                                >
                                    <ListItemText
                                        primary={
                                            <Box className="flex items-center gap-2">
                                            <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                                {result.attribute.DisplayName}
                                            </Typography>
                                            <Chip 
                                                label={getAttributeTypeLabel(result.attribute.AttributeType)}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {result.attribute.IsCustomAttribute && (
                                                <Chip 
                                                label="Custom"
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                        <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                                            {result.entity.DisplayName} • {result.group}
                                        </Typography>
                                        <Typography component="div" variant="caption" sx={{ color: 'text.secondary' }}>
                                            {result.attribute.SchemaName}
                                        </Typography>
                                        </Box>
                                    }
                                    />
                                </ListItemButton>
                                </ListItem>
                            ))}
                            </List>
                        </Paper>
                        ) : (
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            No attributes found matching &quot;{searchTerm}&quot;
                        </Typography>
                        )}
                    </Box>
                    )}

                    {searchTerm.trim() && searchTerm.length < 2 && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} className="mb-8">
                        Enter at least 2 characters to search attributes
                    </Typography>
                    )}

                    {!selectedAttribute && (
                        <Typography variant="h6" className=''>
                            Welcome to the processes search. Please <b>search</b> and select an attribute to see related processes.
                        </Typography>
                    )}

                    {/* GRID WITH SELECTED ATTRIBUTE */}
                    {selectedAttribute && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <NotchedBox 
                                variant="outlined"
                                notchContent={<IconButton onClick={() => setSelectedAttribute(null)}><CloseRounded /></IconButton>}
                                className='flex flex-col items-center justify-center h-full w-full'
                            >
                                <Box p={2}>
                                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                                        Selected Attribute
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        [{selectedAttribute.group} ({selectedAttribute.entity.DisplayName})]: <b>{selectedAttribute.attribute.DisplayName}</b>
                                    </Typography>
                                </Box>
                                <Box className='flex flex-grow' style={{ height: '300px', width: '100%' }}>
                                    {chartData.length > 0 ? (
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
                                                modifiers: [
                                                    [
                                                        'darker',
                                                        0.2
                                                    ]
                                                ]
                                            }}
                                            arcLinkLabelsSkipAngle={10}
                                            arcLinkLabelsTextColor={theme.palette.text.secondary}
                                            arcLinkLabelsThickness={2}
                                            arcLinkLabelsColor={{ from: 'color' }}
                                            arcLabelsSkipAngle={10}
                                            arcLabelsTextColor={{
                                                from: 'color',
                                                modifiers: [
                                                    [
                                                        'darker',
                                                        2
                                                    ]
                                                ]
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
                                    ) : (
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            No usage data available
                                        </Typography>
                                    )}
                                </Box>
                            </NotchedBox>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper variant='outlined' className='rounded-2xl h-full' sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box className="p-4 border-b" sx={{ borderColor: 'border.main' }}>
                                    <Typography variant='h6'>Processes</Typography>
                                </Box>
                                <Box sx={{ flex: 1, overflowX: 'auto' }}>
                                    {selectedAttribute?.attribute.AttributeUsages.length === 0 ? (
                                        <Box className="p-4 text-center" sx={{ color: 'text.secondary' }}>
                                            <Typography variant="body2">No process usage data available for this attribute</Typography>
                                        </Box>
                                    ) : (
                                        <Box 
                                            className="overflow-x-auto md:overflow-x-visible"
                                            sx={{ 
                                                borderTop: 1, 
                                                borderColor: 'border.main',
                                                maxHeight: '400px',
                                                overflowY: 'auto',
                                                // Mobile: allow horizontal scrolling within the component
                                                maxWidth: '100%',
                                                '@media (max-width: 768px)': {
                                                    overflowX: 'auto',
                                                    '&::-webkit-scrollbar': {
                                                        height: '8px',
                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                        borderRadius: '4px',
                                                    },
                                                }
                                            }}
                                        >
                                            <Table 
                                                stickyHeader
                                                className="w-full min-w-[600px] md:min-w-0"
                                                sx={{ 
                                                    borderColor: 'border.main'
                                                }}
                                            >
                                                <TableHead sx={{ backgroundColor: 'background.paper' }}>
                                                    <TableRow className="border-b-2" sx={{ borderColor: 'border.main' }}>
                                                        <TableCell align='center'
                                                            className="w-[25%] font-semibold py-1 md:py-1.5 text-xs md:text-sm"
                                                            sx={{ 
                                                                color: 'text.primary',
                                                                backgroundColor: 'background.paper',
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            Process
                                                        </TableCell>
                                                        <TableCell 
                                                            className="w-[35%] font-semibold py-1 md:py-1.5 text-xs md:text-sm"
                                                            sx={{ 
                                                                color: 'text.primary',
                                                                backgroundColor: 'background.paper',
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            Name
                                                        </TableCell>
                                                        <TableCell 
                                                            className="w-[20%] font-semibold py-1 md:py-1.5 text-xs md:text-sm"
                                                            sx={{ 
                                                                color: 'text.primary',
                                                                backgroundColor: 'background.paper',
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            Type
                                                        </TableCell>
                                                        <TableCell 
                                                            className="w-[20%] font-semibold py-1 md:py-1.5 text-xs md:text-sm"
                                                            sx={{ 
                                                                color: 'text.primary',
                                                                backgroundColor: 'background.paper',
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: 1
                                                            }}
                                                        >
                                                            Usage
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedAttribute?.attribute.AttributeUsages.map((usage, idx) => (
                                                        <TableRow 
                                                            key={usage.Name + idx}
                                                            className="transition-colors duration-150 border-b"
                                                            sx={{
                                                                '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' },
                                                                borderColor: 'border.main',
                                                                backgroundColor: idx % 2 === 0 
                                                                    ? 'background.paper' 
                                                                    : theme.palette.mode === 'dark' 
                                                                        ? 'rgba(255, 255, 255, 0.02)' 
                                                                        : 'rgba(0, 0, 0, 0.02)'
                                                            }}
                                                        >
                                                            <TableCell align='center' className="break-words py-1 md:py-1.5 text-xs md:text-sm">
                                                                {getProcessChip(usage.ComponentType)}
                                                            </TableCell>
                                                            <TableCell className="break-words py-1 md:py-1.5 text-xs md:text-sm">
                                                                {usage.Name}
                                                            </TableCell>
                                                            <TableCell className="break-words py-1 md:py-1.5 text-xs md:text-sm">
                                                                {OperationType[usage.OperationType]}
                                                            </TableCell>
                                                            <TableCell className="break-words py-1 md:py-1.5 text-xs md:text-sm">
                                                                {usage.Usage}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>)}

                    <Divider className='my-8' />

                    {/* Warnings */}
                    <Paper variant='outlined' className="w-full rounded-2xl p-4 h-64">
                        <Typography variant='h6' className="font-semibold">Errorness attributes</Typography>
                        <Box className="overflow-y-auto h-48">
                            {warnings.filter(warning => warning.Type === WarningType.Attribute).map((warning, index) => (
                                <Alert 
                                    key={`warning-${index}`} severity="error" className='my-2 rounded-lg'>
                                    {warning.Message}
                                </Alert>
                            ))}
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
        </>
    )
}