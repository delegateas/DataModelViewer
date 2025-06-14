'use client'

import { useEffect, useState } from "react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { AttributeType, EntityType } from "@/lib/Types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { EntityHeader } from "./entity/EntityHeader"
import { SecurityRoles } from "./entity/SecurityRoles"
import { AttributeDetails } from "./entity/AttributeDetails"
import Relationships from "./Relationships"
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
import { KeyRound, Tags, Unplug, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

type SortDirection = 'asc' | 'desc' | null
type SortColumn = 'displayName' | 'schemaName' | 'type' | 'details' | 'description' | null

function Section({
    entity,
    selected,
    onSelect
}: {
    entity: EntityType,
    selected: string | null,
    onSelect: (entity: string) => void
}) {
    const isSelected = selected?.toLowerCase() === entity.SchemaName.toLocaleLowerCase()
    const [contentRef, shouldScrollTo] = useScrollTo<HTMLDivElement>()
    const [sortColumn, setSortColumn] = useState<SortColumn>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    useEffect(() => {
        if (isSelected) {
            shouldScrollTo(true)
        }
    }, [isSelected])

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
        if (!sortColumn || !sortDirection) return entity.Attributes

        return [...entity.Attributes].sort((a, b) => {
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

    return (
        <div ref={contentRef} className="mb-10">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:justify-between min-w-0">
                    <div className="min-w-0 xl:pr-5">
                        <EntityHeader entity={entity} />
                    </div>
                    {entity.SecurityRoles.length > 0 &&
                        <div className="w-fit border-t xl:border-t-0 xl:border-l xl:px-5 mt-5 pt-5 xl:mt-0 xl:pt-0">
                            <SecurityRoles roles={entity.SecurityRoles} />
                        </div>}
                </div>

                <Tabs defaultValue="attributes">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                        <TabsList className="bg-transparent p-0">
                            <TabsTrigger value="attributes" className="data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                <Tags className="mr-2 h-4 w-4" />Attributes [{entity.Attributes.length}]
                            </TabsTrigger>
                            {entity.Relationships.length ? 
                                <TabsTrigger value="relationships" className="data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                    <Unplug className="mr-2 h-4 w-4" />Relationships [{entity.Relationships.length}]
                                </TabsTrigger> 
                                : <></> 
                            }
                            <TabsTrigger value="keys" className="data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                <KeyRound className="mr-2 h-4 w-4" />Keys [{}]
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="attributes" className="m-0 p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-b-2 border-gray-200">
                                            <TableHead 
                                                className="w-[15%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('displayName')}
                                            >
                                                <div className="flex items-center">
                                                    Display Name
                                                    <SortIcon column="displayName" />
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="w-[15%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('schemaName')}
                                            >
                                                <div className="flex items-center">
                                                    Schema Name
                                                    <SortIcon column="schemaName" />
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="w-[30%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('type')}
                                            >
                                                <div className="flex items-center">
                                                    Type
                                                    <SortIcon column="type" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[5%] text-black font-bold py-3">Details</TableHead>
                                            <TableHead 
                                                className="w-[35%] text-black font-bold py-3 cursor-pointer hover:bg-gray-200"
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
                                                <TableCell className="break-words font-medium py-3">{attribute.DisplayName}</TableCell>
                                                <TableCell className="break-words text-gray-600 py-3">{attribute.SchemaName}</TableCell>
                                                <TableCell className="break-words py-3">{getAttributeComponent(entity, attribute, onSelect)}</TableCell>
                                                <TableCell className="py-3"><AttributeDetails attribute={attribute} /></TableCell>
                                                <TableCell className="break-words text-gray-600 py-3">{attribute.Description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                        <TabsContent value="relationships" className="m-0 p-0">
                            <Relationships entity={entity} onSelect={onSelect} />
                        </TabsContent>
                        <TabsContent value="keys" className="m-0 p-0">
                            <div className="p-4 text-gray-500 text-center">No keys available</div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

function getAttributeComponent(entity: EntityType, attribute: AttributeType, onSelect: (entity: string) => void) {
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
            return <LookupAttribute key={key} attribute={attribute} onSelect={onSelect} />;
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

export default Section