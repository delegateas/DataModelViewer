'use client'

import { EntityType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../shared/ui/table"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"
import { Input } from "../shared/ui/input"
import { Button } from "../shared/ui/button"
import React from "react"
import { highlightMatch } from "../datamodelview/List";

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
            <div className="flex flex-col gap-2 p-2 border-b border-gray-100 md:p-4 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-1.5 top-2 h-3 w-3 text-gray-500 md:left-2 md:top-2.5 md:h-4 md:w-4" />
                        <Input
                            placeholder="Search keys..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setSearchQuery("")
                                }
                            }}
                            className="pl-6 pr-8 h-8 text-xs md:pl-8 md:pr-10 md:h-10 md:text-sm"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-1 top-1 h-6 w-6 text-gray-400 hover:text-gray-600 md:right-1 md:top-1.5 md:h-7 md:w-7"
                                title="Clear search"
                            >
                                <X className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        )}
                    </div>
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchQuery("")}
                            className="h-8 w-8 text-gray-500 hover:text-gray-700 md:h-10 md:w-10"
                            title="Clear search"
                        >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                    )}
                </div>
                {search && search.length >= 3 && searchQuery && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md md:text-sm">
                        <Search className="h-3 w-3 md:h-4 md:w-4" />
                        <span>Warning: Global search &quot;{search}&quot; is also active</span>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
                {sortedKeys.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {searchQuery ? (
                            <div className="flex flex-col items-center gap-2">
                                <p>No keys found matching &quot;{searchQuery}&quot;</p>
                                <Button
                                    variant="ghost"
                                    onClick={() => setSearchQuery("")}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    Clear search
                                </Button>
                            </div>
                        ) : (
                            <p>No keys available for this table</p>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b-2 border-gray-200">
                                <TableHead 
                                    className="w-[25%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Name
                                        <SortIcon column="name" />
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="w-[25%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                    onClick={() => handleSort('logicalName')}
                                >
                                    <div className="flex items-center">
                                        Logical Name
                                        <SortIcon column="logicalName" />
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="w-[50%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                    onClick={() => handleSort('attributes')}
                                >
                                    <div className="flex items-center">
                                        Key Attributes
                                        <SortIcon column="attributes" />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedKeys.map((key, index) => (
                                <TableRow 
                                    key={key.LogicalName}
                                    className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                                >
                                    <TableCell className="break-words font-medium py-2 text-xs md:py-3 md:text-sm">
                                        {highlightMatch(key.Name, highlightTerm)}
                                    </TableCell>
                                    <TableCell className="break-words text-gray-600 py-2 text-xs md:py-3 md:text-sm">
                                        {highlightMatch(key.LogicalName, highlightTerm)}
                                    </TableCell>
                                    <TableCell className="break-words py-2 md:py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {key.KeyAttributes.map((attr, i) => (
                                                <span 
                                                    key={i}
                                                    className="inline-flex items-center px-1.5 py-0.5 text-xs rounded-md font-medium bg-blue-50 text-blue-700 md:px-2 md:py-1 md:text-sm"
                                                >
                                                    {highlightMatch(attr, highlightTerm)}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </>
    )
}

export default Keys 