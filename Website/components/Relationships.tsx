'use client'

import { EntityType, RelationshipType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table"
import { Button } from "./ui/button"
import { CascadeConfiguration } from "./entity/CascadeConfiguration"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'name' | 'tableSchema' | 'lookupField' | 'type' | 'behavior' | 'schemaName' | null

function Relationships({ entity, onSelect }: { entity: EntityType, onSelect: (entity: string) => void }) {
    const [sortColumn, setSortColumn] = useState<SortColumn>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

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
        if (!sortColumn || !sortDirection) return entity.Relationships

        return [...entity.Relationships].sort((a, b) => {
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

    return <>
        <div className="overflow-x-auto">
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
        </div>
    </>
}

export default Relationships;