'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useDatamodelData } from '@/contexts/DatamodelDataContext'
import { Box, Typography, Paper, TextField, InputAdornment, Grid, List, ListItem, ListItemButton, ListItemText, Chip, IconButton, Table, TableHead, TableBody, TableRow, TableCell, useTheme } from '@mui/material'
import { CloseRounded, SearchRounded } from '@mui/icons-material'
import { AttributeType, EntityType, ComponentType } from '@/lib/Types'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import NotchedBox from '../shared/elements/NotchedBox'
import { ResponsivePie } from '@nivo/pie'

interface IProcessesViewProps { }

interface AttributeSearchResult {
  attribute: AttributeType
  entity: EntityType
  group: string
}

export const ProcessesView = ({ }: IProcessesViewProps) => {
    const { setElement, close } = useSidebar()
    const { groups } = useDatamodelData()
    const theme = useTheme()
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [selectedAttribute, setSelectedAttribute] = useState<AttributeSearchResult | null>(null)

    // Custom tooltip component that uses MUI theme
    const CustomTooltip = ({ datum }: any) => (
        <Paper
            elevation={3}
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                padding: 1,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <Typography variant="body2" component="div">
                <strong>{datum.label}</strong>: {datum.value}
            </Typography>
        </Paper>
    )

    useEffect(() => {
        setElement(null);
        close();
    }, [setElement, close])

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
        
        console.log('Chart data:', data); // Debug log
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

    return (
        <>
        <LoadingOverlay open={isSearching} message="Searching attributes..." />
        <Box className="flex min-h-screen">
            <Box className="flex-1 overflow-auto" sx={{ backgroundColor: 'background.default' }}>
            <Box className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Page Title */}
                <Typography 
                variant="h3" 
                component="h1" 
                className="text-3xl sm:text-4xl font-bold mb-8 text-center"
                sx={{ color: 'text.primary' }}
                >
                Processes
                </Typography>

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
                            <ListItem key={`${result.entity.SchemaName}-${result.attribute.SchemaName}`} disablePadding>
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
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {result.entity.DisplayName} • {result.group}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                        No attributes found matching "{searchTerm}"
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
                    <Typography variant="h6" className='text-center'>
                        Welcome to the processes search. Please select an attribute to see related processes.
                    </Typography>
                )}
                {/* GRID WITH SELECTED ATTRIBUTE */}
                {selectedAttribute && (
                <Grid container spacing={2}>
                    <Grid size={4}>
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
                                    [{selectedAttribute.group} ({selectedAttribute.entity.DisplayName})]: {selectedAttribute.attribute.DisplayName}
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
                    <Grid size={8}>
                        <Paper variant='outlined' className='rounded-2xl p-4 h-full'>
                            <Typography variant='h6'>Processes</Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Process</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Location</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedAttribute?.attribute.AttributeUsages.map(usage => (
                                        <TableRow key={usage.Name}>
                                            <TableCell>{usage.ComponentType}</TableCell>
                                            <TableCell>{usage.Name}</TableCell>
                                            <TableCell>{usage.OperationType}</TableCell>
                                            <TableCell>{usage.LocationType}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>)}
            </Box>
        </Box>
        </Box>
        </>
    )
}