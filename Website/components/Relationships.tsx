'use client'

import { EntityType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table"
import { Button } from "./ui/button"
import { CascadeConfiguration } from "./entity/CascadeConfiguration"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'name' | 'tableSchema' | 'lookupField' | 'type' | 'behavior' | 'schemaName' | null

function Relationships({ entity, onSelect }: { entity: EntityType, onSelect: (entity: string) => void }) {
    const [sortColumn, setSortColumn] = useState<SortColumn>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [typeFilter, setTypeFilter] = useState<string>("all")
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
        if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />
        if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
        if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />
        return <ArrowUpDown className="ml-2 h-4 w-4" />
    }

    const relationshipTypes = [
        { value: "all", label: "All Types" },
        { value: "many-to-many", label: "Many-to-Many" },
        { value: "one-to-many", label: "One-to-Many" }
    ]

    return <>
        <div className="p-4 border-b flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search relationships..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    {relationshipTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {(searchQuery || typeFilter !== "all") && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSearchQuery("")
                        setTypeFilter("all")
                    }}
                    className="h-10 w-10 text-gray-500 hover:text-gray-700"
                    title="Clear filters"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
        <div className="overflow-x-auto">
            {getSortedRelationships().length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    {searchQuery || typeFilter !== "all" ? (
                        <div className="flex flex-col items-center gap-2">
                            <p>
                                {searchQuery && typeFilter !== "all" 
                                    ? `No ${typeFilter === "many-to-many" ? "many-to-many" : "one-to-many"} relationships found matching "${searchQuery}"`
                                    : searchQuery 
                                        ? `No relationships found matching "${searchQuery}"`
                                        : `No ${typeFilter === "many-to-many" ? "many-to-many" : "one-to-many"} relationships available`
                                }
                            </p>
                            <Button
                                variant="ghost"
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
                        <p>No relationships available for this entity</p>
                    )}
                </div>
            ) : (
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-b-2 border-gray-200">
                            <TableHead 
                                className="w-[15%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Name
                                    <SortIcon column="name" />
                                </div>
                            </TableHead>
                            <TableHead 
                                className="w-[15%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSort('tableSchema')}
                            >
                                <div className="flex items-center">
                                    Related Table
                                    <SortIcon column="tableSchema" />
                                </div>
                            </TableHead>
                            <TableHead 
                                className="w-[15%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSort('lookupField')}
                            >
                                <div className="flex items-center">
                                    Lookup Field
                                    <SortIcon column="lookupField" />
                                </div>
                            </TableHead>
                            <TableHead 
                                className="w-[10%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSort('type')}
                            >
                                <div className="flex items-center">
                                    Type
                                    <SortIcon column="type" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[25%] text-black font-bold py-3">Behavior</TableHead>
                            <TableHead 
                                className="w-[20%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSort('schemaName')}
                            >
                                <div className="flex items-center">
                                    Schema Name
                                    <SortIcon column="schemaName" />
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getSortedRelationships().map((relationship, index) =>
                            <TableRow 
                                key={relationship.RelationshipSchema}
                                className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                            >
                                <TableCell className="break-words py-3">{relationship.Name}</TableCell>
                                <TableCell className="py-3">
                                    <Button
                                        key={relationship.TableSchema}
                                        variant="ghost"
                                        className="p-0 text-base text-blue-600 underline dark:text-blue-500 hover:no-underline break-words"
                                        onClick={() => onSelect(relationship.TableSchema)}>
                                        {relationship.TableSchema}
                                    </Button>
                                </TableCell>
                                <TableCell className="break-words py-3">{relationship.LookupDisplayName}</TableCell>
                                <TableCell className="py-3">{relationship.IsManyToMany ? "N:N" : "1:N"}</TableCell>
                                <TableCell className="py-3"><CascadeConfiguration config={relationship.CascadeConfiguration} /></TableCell>
                                <TableCell className="break-words py-3">{relationship.RelationshipSchema}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    </>
}

export default Relationships;