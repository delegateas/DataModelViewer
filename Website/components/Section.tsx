'use client'

import { useEffect } from "react"
import { Link } from "lucide-react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { EntityType } from "@/lib/Types"
import ChoiceAttribute from "./attributes/ChoiceAttribute"
import DateTimeAttribute from "./attributes/DateTimeAttribute"
import GenericAttribute from "./attributes/GenericAttribute"
import IntegerAttribute from "./attributes/IntegerAttribute"
import LookupAttribute from "./attributes/LookupAttribute"
import MoneyAttribute from "./attributes/DecimalAttribute"
import StatusAttribute from "./attributes/StatusAttribute"
import StringAttribute from "./attributes/StringAttribute"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table"
import BooleanAttribute from "./attributes/BooleanAttribute"
import FileAttribute from "./attributes/FileAttribute"

function Section({
    entity,
    selected,
    onSelect }: {
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

    return <div ref={contentRef} className="mb-5">
        <a className="flex flex-row gap-2 items-center hover:underline" href={`?selected=${entity.SchemaName}`}><Link /> <h2 className="text-xl">{entity.DisplayName} ({entity.SchemaName})</h2></a>
        <p className="my-4">{entity.Description}</p>
        <Table className="border">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="w-1/6 text-black font-bold">Display Name</TableHead>
                    <TableHead className="w-1/6 text-black font-bold">Schema Name</TableHead>
                    <TableHead className="w-2/6 text-black font-bold">Type</TableHead>
                    <TableHead className="w-2/6 text-black font-bold">Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="striped">
                {entity.Attributes.map((attribute) => {
                    switch (attribute.AttributeType) {
                        case "ChoiceAttribute":
                            return <ChoiceAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "DateTimeAttribute":
                            return <DateTimeAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "GenericAttribute":
                            return <GenericAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "IntegerAttribute":
                            return <IntegerAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "LookupAttribute":
                            return <LookupAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} onSelect={onSelect} />
                        case "DecimalAttribute":
                            return <MoneyAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "StatusAttribute":
                            return <StatusAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "StringAttribute":
                            return <StringAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        case "BooleanAttribute":
                            return <BooleanAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                            case "FileAttribute":
                            return <FileAttribute key={attribute.SchemaName + entity.SchemaName} attribute={attribute} />
                        default:
                            return null
                    }
                })}
            </TableBody>
        </Table>
    </div>
}

export default Section