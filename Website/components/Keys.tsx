'use client'

import { EntityType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

type SortColumn = 'name' | 'logicalName' | 'attributes' | null
type SortDirection = 'asc' | 'desc' | null

function Keys({ entity }: { entity: EntityType }) {
    const [sortColumn, setSortColumn] = useState<SortColumn>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
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

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />
        if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
        if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />
        return <ArrowUpDown className="ml-2 h-4 w-4" />
    }

    return (
        <>
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search keys..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchQuery("")}
                        className="h-10 w-10 text-gray-500 hover:text-gray-700"
                        title="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="overflow-x-auto">
                {getSortedKeys().length === 0 ? (
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
                            <p>No keys available for this entity</p>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b-2 border-gray-200">
                                <TableHead 
                                    className="w-[25%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Name
                                        <SortIcon column="name" />
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="w-[25%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('logicalName')}
                                >
                                    <div className="flex items-center">
                                        Logical Name
                                        <SortIcon column="logicalName" />
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="w-[50%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
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
                            {getSortedKeys().map((key, index) => (
                                <TableRow 
                                    key={key.LogicalName}
                                    className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                                >
                                    <TableCell className="break-words font-medium py-3">{key.Name}</TableCell>
                                    <TableCell className="break-words text-gray-600 py-3">{key.LogicalName}</TableCell>
                                    <TableCell className="break-words py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {key.KeyAttributes.map((attr, i) => (
                                                <span 
                                                    key={i}
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700"
                                                >
                                                    {attr}
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