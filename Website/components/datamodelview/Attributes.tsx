'use client'

import { EntityType, AttributeType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../ui/table"
import { Button } from "../ui/button"
import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X, EyeOff, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select"
import { Input } from "./../ui/input"
import { AttributeDetails } from "./../entity/AttributeDetails"
import BooleanAttribute from "./../attributes/BooleanAttribute"
import ChoiceAttribute from "./../attributes/ChoiceAttribute"
import DateTimeAttribute from "./../attributes/DateTimeAttribute"
import DecimalAttribute from "./../attributes/DecimalAttribute"
import FileAttribute from "./../attributes/FileAttribute"
import GenericAttribute from "./../attributes/GenericAttribute"
import IntegerAttribute from "./../attributes/IntegerAttribute"
import LookupAttribute from "./../attributes/LookupAttribute"
import StatusAttribute from "./../attributes/StatusAttribute"
import StringAttribute from "./../attributes/StringAttribute"

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'displayName' | 'schemaName' | 'type' | 'description' | null

interface IAttributeProps {
    entity: EntityType
}

export const Attributes = ({ entity }: IAttributeProps) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>("displayName")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [hideStandardFields, setHideStandardFields] = useState<boolean>(true)
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

    const getSortedAttributes = () => {
        let filteredAttributes = entity.Attributes

        if (typeFilter !== "all") {
            filteredAttributes = filteredAttributes.filter(attr => attr.AttributeType === typeFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filteredAttributes = filteredAttributes.filter(attr => 
                attr.DisplayName.toLowerCase().includes(query) ||
                attr.SchemaName.toLowerCase().includes(query) ||
                attr.AttributeType.toLowerCase().includes(query) ||
                (attr.Description?.toLowerCase().includes(query) ?? false)
            )
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

    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />
        if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />
        if (sortDirection === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />
        return <ArrowUpDown className="ml-2 h-4 w-4" />
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
        <div className="p-2 gap-2 border-b flex md:p-4 md:gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-1.5 top-2 h-3 w-3 text-muted-foreground md:left-2 md:top-2.5 md:h-4 md:w-4" />
                <Input
                    placeholder="Search attributes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-6 h-8 text-xs md:pl-8 md:h-10 md:text-sm"
                />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs md:w-[200px] md:h-10 md:text-sm">
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    {attributeTypes.map(type => (
                        <SelectItem key={type} value={type} className="text-xs md:text-sm">
                            {type === "all" ? "All Types" : type.replace("Attribute", "")}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                variant="destructive"
                size="icon"
                onClick={() => setHideStandardFields(!hideStandardFields)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-300 text-gray-500 hover:text-gray-700 md:h-10 md:w-10"
                title="Control customfields"
            >
                {
                    hideStandardFields ? <EyeOff className="w-3 h-3 md:w-4 md:h-4" /> : <Eye className="w-3 h-3 md:w-4 md:h-4" />
                }
            </Button>
            {(searchQuery || typeFilter !== "all") && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSearchQuery("")
                        setTypeFilter("all")
                    }}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 md:h-10 md:w-10"
                    title="Clear filters"
                >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
            )}
        </div>
        <div className="overflow-x-auto">
            {getSortedAttributes().length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    {searchQuery || typeFilter !== "all" ? (
                        <div className="flex flex-col items-center gap-2">
                            <p>
                                {searchQuery && typeFilter !== "all" 
                                    ? `No ${typeFilter.replace("Attribute", "")} attributes found matching "${searchQuery}"`
                                    : searchQuery 
                                        ? `No attributes found matching "${searchQuery}"`
                                        : `No ${typeFilter.replace("Attribute", "")} attributes available`
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
                        <p>No attributes available for this entity</p>
                    )}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-b-2 border-gray-200">
                            <TableHead 
                                className="w-[15%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('displayName')}
                            >
                                <div className="flex items-center">
                                    Display Name
                                    <SortIcon column="displayName" />
                                </div>
                            </TableHead>
                            <TableHead 
                                className="w-[15%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('schemaName')}
                            >
                                <div className="flex items-center">
                                    Schema Name
                                    <SortIcon column="schemaName" />
                                </div>
                            </TableHead>
                            <TableHead 
                                className="w-[30%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('type')}
                            >
                                <div className="flex items-center">
                                    Type
                                    <SortIcon column="type" />
                                </div>
                            </TableHead>
                            <TableHead className="w-[5%] text-black font-semibold py-2 text-xs md:font-bold md:py-3 md:text-sm">Details</TableHead>
                            <TableHead 
                                className="w-[35%] text-black font-semibold py-2 text-xs cursor-pointer hover:bg-gray-200 md:font-bold md:py-3 md:text-sm"
                                onClick={() => handleSort('description')}
                            >
                                <div className="flex items-center">
                                    Description
                                    <SortIcon column="description" />
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="striped">
                        {getSortedAttributes().map((attribute, index) => (
                            <TableRow 
                                key={attribute.SchemaName} 
                                className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                            >
                                <TableCell className="break-words font-medium py-2 text-xs md:py-3 md:text-sm">{attribute.DisplayName}</TableCell>
                                <TableCell className="break-words text-gray-600 py-2 text-xs md:py-3 md:text-sm">{attribute.SchemaName}</TableCell>
                                <TableCell className="break-words py-2 md:py-3">{getAttributeComponent(entity, attribute)}</TableCell>
                                <TableCell className="py-2 md:py-3"><AttributeDetails attribute={attribute} /></TableCell>
                                <TableCell className="break-words text-gray-600 py-2 text-xs md:py-3 md:text-sm">{attribute.Description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    </>
}

function getAttributeComponent(entity: EntityType, attribute: AttributeType) {
    const key = `${attribute.SchemaName}-${entity.SchemaName}`;

    switch (attribute.AttributeType) {
        case 'ChoiceAttribute':
            return <ChoiceAttribute key={key} attribute={attribute} />;
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