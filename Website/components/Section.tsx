'use client'

import { useEffect } from "react"
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
import { KeyRound, Tags, Unplug } from "lucide-react"


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

    useEffect(() => {
        if (isSelected) {
            shouldScrollTo(true)
        }
    }, [isSelected])

    return (
        <div ref={contentRef} className="mb-10">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
                <div className="flex flex-col xl:flex-row xl:justify-between min-w-0">
                    <div className="min-w-0 xl:pr-5">
                        <EntityHeader entity={entity} />
                    </div>
                    {entity.SecurityRoles.length > 0 &&
                        <div className="w-fit border-t xl:border-t-0 xl:border-l xl:px-5 mt-5 pt-5 xl:mt-0 xl:pt-0">
                            <SecurityRoles roles={entity.SecurityRoles} />
                        </div>}
                </div>

                <div className="mt-6 space-y-4">
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
                                                <TableHead className="w-[15%] text-black font-bold py-3">Display Name</TableHead>
                                                <TableHead className="w-[15%] text-black font-bold py-3">Schema Name</TableHead>
                                                <TableHead className="w-[30%] text-black font-bold py-3">Type</TableHead>
                                                <TableHead className="w-[5%] text-black font-bold py-3">Details</TableHead>
                                                <TableHead className="w-[35%] text-black font-bold py-3">Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="striped">
                                            {entity.Attributes.map((attribute, index) => (
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