'use client'

import { EntityType } from "@/lib/Types"
import { CascadeConfiguration } from "./entity/CascadeConfiguration"
import { useState } from "react"
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext"
import React from "react"
import { highlightMatch } from "../datamodelview/List";
import { Button, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, InputAdornment, Box, Typography, useTheme } from "@mui/material"
import { SearchRounded, ClearRounded, ArrowUpwardRounded, ArrowDownwardRounded } from "@mui/icons-material"

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'name' | 'tableSchema' | 'lookupField' | 'type' | 'behavior' | 'schemaName' | null

interface IRelationshipsProps {
    entity: EntityType;
    onVisibleCountChange?: (count: number) => void;
}

export const Relationships = ({ entity, onVisibleCountChange, search = "" }: IRelationshipsProps & { search?: string }) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>("name")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    
    const theme = useTheme();

    const dispatch = useDatamodelViewDispatch();
    const { scrollToSection } = useDatamodelView();

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortColumn(null)
                setSortDirection(null)
            } else {
                setSortDirection('asc')
            }
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const getSortedRelationships = () => {
        let filteredRelationships = entity.Relationships
        
        if (typeFilter !== "all") {
            filteredRelationships = filteredRelationships.filter(rel => 
                (typeFilter === "many-to-many" && rel.IsManyToMany) || 
                (typeFilter === "one-to-many" && !rel.IsManyToMany)
            )
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filteredRelationships = filteredRelationships.filter(rel => 
                rel.Name.toLowerCase().includes(query) ||
                rel.TableSchema.toLowerCase().includes(query) ||
                rel.LookupDisplayName.toLowerCase().includes(query) ||
                rel.RelationshipSchema.toLowerCase().includes(query)
            )
        }

        // Also filter by parent search prop if provided
        if (search && search.length >= 3) {
            const query = search.toLowerCase()
            filteredRelationships = filteredRelationships.filter(rel => 
                rel.Name.toLowerCase().includes(query) ||
                rel.TableSchema.toLowerCase().includes(query) ||
                rel.LookupDisplayName.toLowerCase().includes(query) ||
                rel.RelationshipSchema.toLowerCase().includes(query)
            )
        }

        if (!sortColumn || !sortDirection) return filteredRelationships

        return [...filteredRelationships].sort((a, b) => {
            let aValue = ''
            let bValue = ''

            switch (sortColumn) {
                case 'name':
                    aValue = a.Name
                    bValue = b.Name
                    break
                case 'tableSchema':
                    aValue = a.TableSchema
                    bValue = b.TableSchema
                    break
                case 'lookupField':
                    aValue = a.LookupDisplayName
                    bValue = b.LookupDisplayName
                    break
                case 'type':
                    aValue = a.IsManyToMany ? "N:N" : "1:N"
                    bValue = b.IsManyToMany ? "N:N" : "1:N"
                    break
                case 'schemaName':
                    aValue = a.RelationshipSchema
                    bValue = b.RelationshipSchema
                    break
                default:
                    return 0
            }

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue)
            } else {
                return bValue.localeCompare(aValue)
            }
        })
    }

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column) return <ArrowUpwardRounded className="ml-2 h-4 w-4" />
        if (sortDirection === 'asc') return <ArrowDownwardRounded className="ml-2 h-4 w-4" />
        if (sortDirection === 'desc') return <ArrowUpwardRounded className="ml-2 h-4 w-4" />
        return <ArrowDownwardRounded className="ml-2 h-4 w-4" />
    }

    const relationshipTypes = [
        { value: "all", label: "All Types" },
        { value: "many-to-many", label: "Many-to-Many" },
        { value: "one-to-many", label: "One-to-Many" }
    ]

    const sortedRelationships = getSortedRelationships();
    const highlightTerm = searchQuery || search; // Use internal search or parent search for highlighting

    React.useEffect(() => {
        if (onVisibleCountChange) {
            onVisibleCountChange(sortedRelationships.length);
        }
    }, [onVisibleCountChange, sortedRelationships.length]);

    return <>
        <Box 
            sx={{ 
                p: { xs: 1, md: 2 }, 
                gap: { xs: 1, md: 2 }, 
                borderBottom: 1, 
                borderColor: 'border.main',
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: 'background.paper'
            }}
        >
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="Search relationships..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setSearchQuery("")
                        }
                    }}
                    sx={{ 
                        flexGrow: 1,
                        '& .MuiInputBase-input': {
                            fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment>,
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => setSearchQuery("")}
                                        title="Clear search"
                                        sx={{ minWidth: 'auto', padding: 0 }}
                                    >
                                        <ClearRounded sx={{ fontSize: { xs: '0.75rem', md: '1rem' } }} />
                                    </Button>
                                </InputAdornment>
                            )
                        }
                    }}   
                />
                <FormControl size="small">
                    <InputLabel id="relationship-type-filter-label" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                        Filter by type
                    </InputLabel>
                    <Select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        label="Filter by type"
                        labelId="relationship-type-filter-label"
                        sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                        {relationshipTypes.map(type => (
                            <MenuItem key={type.value} value={type.value} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {(searchQuery || typeFilter !== "all") && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            setSearchQuery("")
                            setTypeFilter("all")
                        }}
                        title="Clear filters"
                        sx={{ 
                            minWidth: 'auto', 
                            padding: 0,
                            height: { xs: '32px', md: '40px' },
                            width: { xs: '32px', md: '40px' }
                        }}
                    >
                        <ClearRounded sx={{ fontSize: { xs: '0.75rem', md: '1rem' } }} />
                    </Button>
                )}
            </Box>
            {search && search.length >= 3 && searchQuery && (
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        color: 'warning.dark',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 243, 224, 1)',
                        border: 1,
                        borderColor: 'warning.main',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                    }}
                >
                    <SearchRounded sx={{ fontSize: { xs: '0.75rem', md: '1rem' } }} />
                    <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
                        Warning: Global search &quot;{search}&quot; is also active
                    </Typography>
                </Box>
            )}
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
            {getSortedRelationships().length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    {searchQuery || typeFilter !== "all" ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                                {searchQuery && typeFilter !== "all" 
                                    ? `No ${typeFilter === "many-to-many" ? "many-to-many" : "one-to-many"} relationships found matching "${searchQuery}"`
                                    : searchQuery 
                                        ? `No relationships found matching "${searchQuery}"`
                                        : `No ${typeFilter === "many-to-many" ? "many-to-many" : "one-to-many"} relationships available`
                                }
                            </Typography>
                            <Button
                                variant="text"
                                onClick={() => {
                                    setSearchQuery("")
                                    setTypeFilter("all")
                                }}
                                sx={{ color: 'primary.main' }}
                            >
                                Clear filters
                            </Button>
                        </Box>
                    ) : (
                        <Typography variant="body2">No relationships available for this table</Typography>
                    )}
                </Box>
            ) : (
                <Box 
                    className="overflow-x-auto md:overflow-x-visible"
                    sx={{ 
                        borderTop: 1, 
                        borderColor: 'border.main',
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
                        sx={{ 
                            width: '100%', 
                            borderColor: 'border.main',
                            // Ensure minimum width on mobile to enable horizontal scrolling
                            minWidth: { xs: '900px', md: 'auto' }
                        }}
                    >
                    <TableHead sx={{ backgroundColor: 'background.paper' }}>
                        <TableRow sx={{ borderBottom: 2, borderColor: 'border.main' }}>
                            <TableCell 
                                sx={{ 
                                    width: '15%', 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSort('name')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Name
                                    <SortIcon column="name" />
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ 
                                    width: '15%', 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSort('tableSchema')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Related Table
                                    <SortIcon column="tableSchema" />
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ 
                                    width: '15%', 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSort('lookupField')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Lookup Field
                                    <SortIcon column="lookupField" />
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ 
                                    width: '10%', 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSort('type')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Type
                                    <SortIcon column="type" />
                                </Box>
                            </TableCell>
                            <TableCell 
                                sx={{ 
                                    width: '25%', 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                                }}
                            >
                                Behavior
                            </TableCell>
                            <TableCell 
                                sx={{ 
                                    width: '20%', 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 1.5 },
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSort('schemaName')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Schema Name
                                    <SortIcon column="schemaName" />
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedRelationships.map((relationship, index) =>
                            <TableRow 
                                key={relationship.RelationshipSchema}
                                sx={{
                                    '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)' },
                                    transition: 'background-color 0.15s',
                                    borderBottom: 1,
                                    borderColor: 'border.main',
                                    backgroundColor: index % 2 === 0 
                                        ? 'background.paper' 
                                        : theme.palette.mode === 'dark' 
                                            ? 'rgba(255, 255, 255, 0.02)' 
                                            : 'rgba(0, 0, 0, 0.02)'
                                }}
                            >
                                <TableCell sx={{ wordBreak: 'break-word', py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                    {highlightMatch(relationship.Name, highlightTerm)}
                                </TableCell>
                                <TableCell sx={{ py: { xs: 1, md: 1.5 } }}>
                                    <Button
                                        key={relationship.TableSchema}
                                        variant="text"
                                        sx={{ 
                                            p: 0, 
                                            fontSize: { xs: '0.75rem', md: '1rem' },
                                            color: 'primary.main',
                                            textDecoration: 'underline',
                                            '&:hover': { textDecoration: 'none' },
                                            wordBreak: 'break-word',
                                            textAlign: 'left',
                                            justifyContent: 'flex-start'
                                        }}
                                        onClick={() => {
                                            dispatch({ type: "SET_CURRENT_SECTION", payload: relationship.TableSchema })
                                            scrollToSection(relationship.TableSchema);
                                        }}
                                    >
                                        {highlightMatch(relationship.TableSchema, highlightTerm)}
                                    </Button>
                                </TableCell>
                                <TableCell sx={{ wordBreak: 'break-word', py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                    {relationship.LookupDisplayName}
                                </TableCell>
                                <TableCell sx={{ py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                    {relationship.IsManyToMany ? "N:N" : "1:N"}
                                </TableCell>
                                <TableCell sx={{ py: { xs: 1, md: 1.5 } }}>
                                    <CascadeConfiguration config={relationship.CascadeConfiguration} />
                                </TableCell>
                                <TableCell sx={{ wordBreak: 'break-word', py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                    {relationship.RelationshipSchema}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </Box>
            )}
        </Box>
    </>
}