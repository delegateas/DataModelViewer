'use client'

import { useEffect } from "react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { AttributeType, EntityType } from "@/lib/Types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
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
            <div className="flex flex-col xl:flex-row xl:justify-between min-w-0">
                <div className="min-w-0 xl:pr-5">
                    <EntityHeader entity={entity} />
                </div>
                {entity.SecurityRoles.length > 0 &&
                    <div className="w-fit border-t xl:border-t-0 xl:border-l xl:px-5 mt-5 pt-5 xl:mt-0 xl:pt-0">
                        <SecurityRoles roles={entity.SecurityRoles} />
                    </div>}
            </div>

            <h2 className="mt-4 mb-1 font-bold">Attributes</h2>
            <div className="overflow-x-auto">
                <Table className="border w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="w-[15%] text-black font-bold">Display Name</TableHead>
                            <TableHead className="w-[15%] text-black font-bold">Schema Name</TableHead>
                            <TableHead className="w-[30%] text-black font-bold">Type</TableHead>
                            <TableHead className="w-[5%] text-black font-bold">Details</TableHead>
                            <TableHead className="w-[35%] text-black font-bold">Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="striped">
                        {entity.Attributes.map((attribute) => (
                            <TableRow key={attribute.SchemaName}>
                                <TableCell className="break-words">{attribute.DisplayName}</TableCell>
                                <TableCell className="break-words">{attribute.SchemaName}</TableCell>
                                <TableCell className="break-words">{getAttributeComponent(entity, attribute, onSelect)}</TableCell>
                                <TableCell><AttributeDetails attribute={attribute} /></TableCell>
                                <TableCell className="break-words">{attribute.Description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {entity.Relationships.length > 0 && <Relationships entity={entity} onSelect={onSelect} />}
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