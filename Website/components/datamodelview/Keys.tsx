'use client'

import { EntityType } from "@/lib/Types"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"
import React from "react"
import { highlightMatch } from "../datamodelview/List";
import { 
    Button, 
    TextField, 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Box, 
    Typography, 
    Alert, 
    Chip,
    InputAdornment,
    useTheme
} from "@mui/material"

type SortColumn = 'name' | 'logicalName' | 'attributes' | null
type SortDirection = 'asc' | 'desc' | null

interface IKeysProps {
    entity: EntityType;
    onVisibleCountChange?: (count: number) => void;
}

function Keys({ entity, onVisibleCountChange, search = "" }: IKeysProps & { search?: string }) {
    const [sortColumn, setSortColumn] = useState<SortColumn>("name")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [searchQuery, setSearchQuery] = useState("")
    const theme = useTheme()

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

    const getSortedKeys = () => {
        let filteredKeys = entity.Keys

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filteredKeys = filteredKeys.filter(key => 
                key.Name.toLowerCase().includes(query) ||
                key.LogicalName.toLowerCase().includes(query) ||
                key.KeyAttributes.some(attr => attr.toLowerCase().includes(query))
            )
        }

        // Also filter by parent search prop if provided
        if (search && search.length >= 3) {
            const query = search.toLowerCase()
            filteredKeys = filteredKeys.filter(key => 
                key.Name.toLowerCase().includes(query) ||
                key.LogicalName.toLowerCase().includes(query) ||
                key.KeyAttributes.some(attr => attr.toLowerCase().includes(query))
            )
        }

        if (!sortColumn || !sortDirection) return filteredKeys

        return [...filteredKeys].sort((a, b) => {
            let aValue = ''
            let bValue = ''

            switch (sortColumn) {
                case 'name':
                    aValue = a.Name
                    bValue = b.Name
                    break
                case 'logicalName':
                    aValue = a.LogicalName
                    bValue = b.LogicalName
                    break
                case 'attributes':
                    aValue = a.KeyAttributes.join(', ')
                    bValue = b.KeyAttributes.join(', ')
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

    const sortedKeys = getSortedKeys();
    const highlightTerm = searchQuery || search; // Use internal search or parent search for highlighting

    React.useEffect(() => {
        if (onVisibleCountChange) {
            onVisibleCountChange(sortedKeys.length);
        }
    }, [onVisibleCountChange, sortedKeys.length]);

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />
        if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
        if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />
        return <ArrowUpDown className="ml-2 h-4 w-4" />
    }

    return (
        <>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: { xs: 1, md: 2 }, 
                p: { xs: 1, md: 2 }, 
                borderBottom: 1, 
                borderColor: 'border.main' 
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                    <TextField
                        placeholder="Search keys..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setSearchQuery("")
                            }
                        }}
                        size="small"
                        sx={{ 
                            flexGrow: 1,
                            '& .MuiInputBase-input': {
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                py: { xs: 0.5, md: 1 }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search className="h-3 w-3 md:h-4 md:w-4" style={{ color: theme.palette.text.secondary }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <Button
                                        onClick={() => setSearchQuery("")}
                                        size="small"
                                        sx={{ 
                                            minWidth: 'auto', 
                                            p: 0.5,
                                            color: 'text.secondary',
                                            '&:hover': { color: 'text.primary' }
                                        }}
                                        title="Clear search"
                                    >
                                        <X className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
                {search && search.length >= 3 && searchQuery && (
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            py: 0.5,
                            '& .MuiAlert-icon': {
                                fontSize: { xs: '0.875rem', md: '1rem' }
                            }
                        }}
                    >
                        Warning: Global search "{search}" is also active
                    </Alert>
                )}
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
                {sortedKeys.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        {searchQuery ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                    No keys found matching "{searchQuery}"
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => setSearchQuery("")}
                                    sx={{ color: 'primary.main' }}
                                >
                                    Clear search
                                </Button>
                            </Box>
                        ) : (
                            <Typography variant="body2">No keys available for this table</Typography>
                        )}
                    </Box>
                ) : (
                    <Table sx={{ width: '100%', borderTop: 1, borderColor: 'border.main' }}>
                        <TableHead sx={{ backgroundColor: 'background.paper' }}>
                            <TableRow sx={{ borderBottom: 2, borderColor: 'border.main' }}>
                                <TableCell 
                                    sx={{ 
                                        width: '25%', 
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
                                        width: '25%', 
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        py: { xs: 1, md: 1.5 },
                                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSort('logicalName')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Logical Name
                                        <SortIcon column="logicalName" />
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        width: '50%', 
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        py: { xs: 1, md: 1.5 },
                                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleSort('attributes')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Key Attributes
                                        <SortIcon column="attributes" />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedKeys.map((key, index) => (
                                <TableRow 
                                    key={key.LogicalName}
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
                                    <TableCell sx={{ 
                                        wordBreak: 'break-word', 
                                        fontWeight: 500, 
                                        py: { xs: 1, md: 1.5 }, 
                                        fontSize: { xs: '0.75rem', md: '0.875rem' } 
                                    }}>
                                        {highlightMatch(key.Name, highlightTerm)}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        wordBreak: 'break-word', 
                                        color: 'text.secondary', 
                                        py: { xs: 1, md: 1.5 }, 
                                        fontSize: { xs: '0.75rem', md: '0.875rem' } 
                                    }}>
                                        {highlightMatch(key.LogicalName, highlightTerm)}
                                    </TableCell>
                                    <TableCell sx={{ wordBreak: 'break-word', py: { xs: 1, md: 1.5 } }}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {key.KeyAttributes.map((attr, i) => (
                                                <Chip 
                                                    key={i}
                                                    label={highlightMatch(attr, highlightTerm)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: { xs: '0.65rem', md: '0.75rem' },
                                                        height: { xs: '20px', md: '24px' },
                                                        backgroundColor: theme.palette.mode === 'dark' 
                                                            ? 'rgba(25, 118, 210, 0.12)' 
                                                            : 'rgba(25, 118, 210, 0.08)',
                                                        color: 'primary.main',
                                                        borderColor: 'primary.main',
                                                        '& .MuiChip-label': {
                                                            px: { xs: 0.5, md: 1 }
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Box>
        </>
    )
}

export default Keys 