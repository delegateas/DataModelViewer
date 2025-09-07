'use client'

import { EntityType, AttributeType } from "@/lib/Types"
import { useState } from "react"
import { AttributeDetails } from "./entity/AttributeDetails"
import BooleanAttribute from "./attributes/BooleanAttribute"
import ChoiceAttribute from "./attributes/ChoiceAttribute"
import DateTimeAttribute from "./attributes/DateTimeAttribute"
import DecimalAttribute from "./attributes/DecimalAttribute"
import FileAttribute from "./attributes/FileAttribute"
import GenericAttribute from "./attributes/GenericAttribute"
import IntegerAttribute from "./attributes/IntegerAttribute"
import LookupAttribute from "./attributes/LookupAttribute"
import StatusAttribute from "./attributes/StatusAttribute"
import StringAttribute from "./attributes/StringAttribute"
import React from "react"
import { highlightMatch } from "../datamodelview/List";
import { Alert, Box, Button, FormControl, Input, InputAdornment, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useTheme } from "@mui/material"
import { CloseRounded, NorthRounded, SearchRounded, SouthRounded, Visibility, VisibilityOff } from "@mui/icons-material"

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'displayName' | 'schemaName' | 'type' | 'description' | null

interface IAttributeProps {
    entity: EntityType
    onVisibleCountChange?: (count: number) => void
}

export const Attributes = ({ entity, onVisibleCountChange, search = "" }: IAttributeProps & { search?: string }) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>("displayName")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [hideStandardFields, setHideStandardFields] = useState<boolean>(true)
    const [searchQuery, setSearchQuery] = useState("")

    const theme = useTheme();

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

    // Helper function to check if an attribute matches a search query
    const attributeMatchesSearch = (attr: AttributeType, query: string): boolean => {
        const basicMatch = attr.DisplayName.toLowerCase().includes(query) ||
            attr.SchemaName.toLowerCase().includes(query) ||
            (attr.Description && attr.Description.toLowerCase().includes(query));
        
        // Check options for ChoiceAttribute and StatusAttribute
        let optionsMatch = false;
        if (attr.AttributeType === 'ChoiceAttribute' || attr.AttributeType === 'StatusAttribute') {
            optionsMatch = attr.Options.some(option => option.Name.toLowerCase().includes(query));
        }
        
        return basicMatch || optionsMatch;
    };

    const getSortedAttributes = () => {
        let filteredAttributes = entity.Attributes

        if (typeFilter !== "all") {
            filteredAttributes = filteredAttributes.filter(attr => attr.AttributeType === typeFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filteredAttributes = filteredAttributes.filter(attr => attributeMatchesSearch(attr, query))
        }

        // Also filter by parent search prop if provided
        if (search && search.length >= 3) {
            const query = search.toLowerCase()
            filteredAttributes = filteredAttributes.filter(attr => attributeMatchesSearch(attr, query))
        }

        if (hideStandardFields) filteredAttributes = filteredAttributes.filter(attr => attr.IsCustomAttribute || attr.IsStandardFieldModified);

        if (!sortColumn || !sortDirection) return filteredAttributes

        return [...filteredAttributes].sort((a, b) => {
            let aValue = ''
            let bValue = ''

            switch (sortColumn) {
                case 'displayName':
                    aValue = a.DisplayName
                    bValue = b.DisplayName
                    break
                case 'schemaName':
                    aValue = a.SchemaName
                    bValue = b.SchemaName
                    break
                case 'type':
                    aValue = a.AttributeType
                    bValue = b.AttributeType
                    break
                case 'description':
                    aValue = a.Description || ''
                    bValue = b.Description || ''
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

    const sortedAttributes = getSortedAttributes();
    const highlightTerm = searchQuery || search; // Use internal search or parent search for highlighting

    // Notify parent of visible count
    React.useEffect(() => {
        if (onVisibleCountChange) {
            onVisibleCountChange(sortedAttributes.length);
        }
    }, [onVisibleCountChange, sortedAttributes.length]);

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column) return <SouthRounded className="ml-2 h-4 w-4" />
        if (sortDirection === 'asc') return <NorthRounded className="ml-2 h-4 w-4" />
        if (sortDirection === 'desc') return <SouthRounded className="ml-2 h-4 w-4" />
        return <NorthRounded className="ml-2 h-4 w-4" />
    }

    const attributeTypes = [
        "all",
        "ChoiceAttribute",
        "DateTimeAttribute",
        "GenericAttribute",
        "IntegerAttribute",
        "LookupAttribute",
        "DecimalAttribute",
        "StatusAttribute",
        "StringAttribute",
        "BooleanAttribute",
        "FileAttribute"
    ]

    return <>
        <Box className="p-2 gap-2 border-b flex flex-col md:p-4 md:gap-4" color="background.paper">
            <Box className="flex gap-2 md:gap-4 items-center">
                <TextField
                    size="small"
                    placeholder="Search attributes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setSearchQuery("")
                        }
                    }}
                    className="p-2 text-xs md:text-sm flex-grow"
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment>,
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-1 top-1 h-6 w-6 text-gray-400 hover:text-gray-600 md:right-1 md:top-1.5 md:h-7 md:w-7"
                                        title="Clear search"
                                        sx={{ minWidth: 'auto', padding: 0 }}
                                    >
                                        <CloseRounded className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                </InputAdornment>
                            )
                        }
                    }}   
                />
                <FormControl>
                    <InputLabel id="type-filter-label" className="text-xs md:text-sm">Filter by type</InputLabel>
                    <Select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)} 
                        size="small" 
                        label="Filter by type"
                        labelId="type-filter-label">
                        {attributeTypes.map(type => (
                        <MenuItem key={type} value={type} className="text-xs md:text-sm">
                            {type === "all" ? "All Types" : type.replace("Attribute", "")}
                        </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setHideStandardFields(!hideStandardFields)}
                    className="h-8 w-8 md:h-10 md:w-10"
                    title="Control customfields"
                    sx={{ minWidth: 'auto', padding: 0, borderColor: 'border.main' }}
                >
                    {
                        hideStandardFields ? <VisibilityOff className="w-3 h-3 md:w-4 md:h-4" /> : <Visibility className="w-3 h-3 md:w-4 md:h-4" />
                    }
                </Button>
                {(searchQuery || typeFilter !== "all") && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            setSearchQuery("")
                            setTypeFilter("all")
                        }}
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 md:h-10 md:w-10"
                        title="Clear filters"
                        sx={{ minWidth: 'auto', padding: 0 }}
                    >
                        <CloseRounded className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                )}
            </Box>
            {search && search.length >= 3 && searchQuery && (
                <Alert icon={<SearchRounded />} severity="warning" className="rounded-lg">
                    Warning: Global search &quot;{search}&quot; is also active
                </Alert>
            )}
        </Box>
        {sortedAttributes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                {searchQuery || typeFilter !== "all" ? (
                    <div className="flex flex-col items-center gap-2">
                        <p>
                            {searchQuery && typeFilter !== "all" 
                                ? `No ${typeFilter === "all" ? "" : typeFilter.replace("Attribute", "")} attributes found matching "${searchQuery}"`
                                : searchQuery 
                                    ? `No attributes found matching "${searchQuery}"`
                                    : `No ${typeFilter === "all" ? "" : typeFilter.replace("Attribute", "")} attributes available`
                            }
                        </p>
                        <Button
                            variant="text"
                            onClick={() => {
                                setSearchQuery("")
                                setTypeFilter("all")
                            }}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Clear filters
                        </Button>
                    </div>
                ) : (
                    <p>No attributes available for this table</p>
                )}
            </div>
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
                    color="background.paper" 
                    sx={{ 
                        borderColor: 'border.main',
                        // Ensure minimum width on mobile to enable horizontal scrolling
                        minWidth: { xs: '800px', md: 'auto' }
                    }}
                >
                    <TableHead sx={{ backgroundColor: 'background.paper', color: 'text.secondary' }}>
                        <TableRow className="border-b-2">
                            <TableCell 
                                className="w-[15%] font-semibold py-2 text-xs cursor-pointer md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('displayName')}
                            >
                                <Typography className="flex items-center font-semibold" variant="body2" sx={{ color: 'text.secondary' }}>
                                    Display Name
                                    <SortIcon column="displayName" />
                                </Typography>
                            </TableCell>
                            <TableCell 
                                className="w-[15%] font-semibold py-2 text-xs cursor-pointer md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('schemaName')}
                            >
                                <Typography className="flex items-center font-semibold" variant="body2" sx={{ color: 'text.secondary' }}>
                                    Schema Name
                                    <SortIcon column="schemaName" />
                                </Typography>
                            </TableCell>
                            <TableCell 
                                className="w-[30%] font-semibold py-2 text-xs cursor-pointer md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('type')}
                            >
                                <Typography className="flex items-center font-semibold" variant="body2" sx={{ color: 'text.secondary' }}>
                                    Type
                                    <SortIcon column="type" />
                                </Typography>
                            </TableCell>
                            <TableCell className="w-[5%] font-semibold py-2 text-xs md:font-bold md:py-3 md:text-sm">
                                <Typography className="flex items-center font-semibold" variant="body2" sx={{ color: 'text.secondary' }}>
                                    Details
                                </Typography>
                        </TableCell>
                        <TableCell 
                            className="w-[35%] font-semibold py-2 text-xs cursor-pointer md:font-bold md:py-3 md:text-sm"
                            onClick={() => handleSort('description')}
                        >
                            <Typography className="flex items-center font-semibold" variant="body2" sx={{ color: 'text.secondary' }}>
                                Description
                                <SortIcon column="description" />
                            </Typography>
                        </TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedAttributes.map((attribute, index) => (
                        <TableRow 
                            key={attribute.SchemaName} 
                            className={`transition-colors duration-150 border-b`}
                            sx={{
                                color: 'text.secondary',
                                borderColor: 'border.main',
                                backgroundColor: index % 2 === 0 
                                    ? 'background.paper' 
                                    : theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.02)' 
                                        : 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            <TableCell className="break-words py-2 text-xs md:py-3 md:text-sm">
                                <Typography className="text-sm" color="text.secondary">{highlightMatch(attribute.DisplayName, highlightTerm)}</Typography>
                            </TableCell>
                            <TableCell className="break-words py-2 text-xs md:py-3 md:text-sm">
                                <Typography className="text-sm" color="text.secondary">{highlightMatch(attribute.SchemaName, highlightTerm)}</Typography>
                            </TableCell>
                            <TableCell className="break-words py-2 md:py-3">{getAttributeComponent(entity, attribute, highlightMatch, highlightTerm)}</TableCell>
                            <TableCell className="py-2 md:py-3"><AttributeDetails attribute={attribute} /></TableCell>
                            <TableCell className="break-words py-2 text-xs md:py-3 md:text-sm">
                                <Typography className="text-sm" color="text.secondary">{highlightMatch(attribute.Description ?? "", highlightTerm)}</Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </Box>
        )}
    </>
}

function getAttributeComponent(entity: EntityType, attribute: AttributeType, highlightMatch: (text: string, term: string) => string | React.JSX.Element, highlightTerm: string) {
    const key = `${attribute.SchemaName}-${entity.SchemaName}`;

    switch (attribute.AttributeType) {
        case 'ChoiceAttribute':
            return <ChoiceAttribute key={key} attribute={attribute} highlightMatch={highlightMatch} highlightTerm={highlightTerm} />;
        case 'DateTimeAttribute':
            return <DateTimeAttribute key={key} attribute={attribute} />;
        case 'GenericAttribute':
            return <GenericAttribute key={key} attribute={attribute} />;
        case 'IntegerAttribute':
            return <IntegerAttribute key={key} attribute={attribute} />;
        case 'LookupAttribute':
            return <LookupAttribute key={key} attribute={attribute} />;
        case 'DecimalAttribute':
            return <DecimalAttribute key={key} attribute={attribute} />;
        case 'StatusAttribute':
            return <StatusAttribute key={key} attribute={attribute} />;
        case 'StringAttribute':
            return <StringAttribute key={key} attribute={attribute} />;
        case 'BooleanAttribute':
            return <BooleanAttribute key={key} attribute={attribute} />;
        case 'FileAttribute':
            return <FileAttribute key={key} attribute={attribute} />;
        default:
            return null;
    }
}