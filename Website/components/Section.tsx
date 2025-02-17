'use client'

import { useEffect } from "react"
import { Ban, Boxes, Building, Building2, CircleAlert, CirclePlus, ClipboardList, Eye, Link, Lock, Paperclip, User, Users } from "lucide-react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { AttributeType, EntityType, OwnershipType, PrivilegeDepth, RequiredLevel } from "@/lib/Types"
import ChoiceAttribute from "./attributes/ChoiceAttribute"
import DateTimeAttribute from "./attributes/DateTimeAttribute"
import GenericAttribute from "./attributes/GenericAttribute"
import IntegerAttribute from "./attributes/IntegerAttribute"
import LookupAttribute from "./attributes/LookupAttribute"
import MoneyAttribute from "./attributes/DecimalAttribute"
import StatusAttribute from "./attributes/StatusAttribute"
import StringAttribute from "./attributes/StringAttribute"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import BooleanAttribute from "./attributes/BooleanAttribute"
import FileAttribute from "./attributes/FileAttribute"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import Relationships from "./Relationships"

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

    return <div ref={contentRef} className="mb-10">
        <div className="flex flex-row justify-start items-start">
            <div className="w-1/2 pr-5">
                <a className="flex flex-row gap-2 items-center hover:underline" href={`?selected=${entity.SchemaName}`}><Link /> <h2 className="text-xl">{entity.DisplayName} ({entity.SchemaName})</h2></a>
                {GetEntityDetails(entity)}
                <p className="my-4">{entity.Description}</p>
            </div>
            <div className="flex flex-col justify-center border-l-2 pl-5 mr-20 gap-2 items-end">
                {entity.SecurityRoles.map(role =>
                    <div key={role.Name} className="flex flex-row justify-end items-center">
                        <p className="font-bold pr-3 w-max">{role.Name}</p>
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-col items-center"><p className="w-max">Create</p>{GetDepthIcon(role.Create)}</div>
                            <div className="flex flex-col items-center"><p className="w-max">Read</p>{GetDepthIcon(role.Read)}</div>
                            <div className="flex flex-col items-center"><p className="w-max">Write</p>{GetDepthIcon(role.Write)}</div>
                            <div className="flex flex-col items-center"><p className="w-max">Delete</p>{GetDepthIcon(role.Delete)}</div>
                            <div className="flex flex-col items-center"><p className="w-max">Append</p>{GetDepthIcon(role.Append)}</div>
                            <div className="flex flex-col items-center"><p className="w-max">Append To</p>{GetDepthIcon(role.AppendTo)}</div>
                            <div className="flex flex-col items-center"><p className="w-max">Assign</p>{GetDepthIcon(role.Assign)}</div>
                        </div>
                    </div>)}
            </div>
        </div>
        <h2 className="mt-4 mb-1 font-bold">Attributes</h2>
        <Table className="border">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="w-1/6 text-black font-bold">Display Name</TableHead>
                    <TableHead className="w-1/6 text-black font-bold">Schema Name</TableHead>
                    <TableHead className="w-2/6 text-black font-bold">Type</TableHead>
                    <TableHead className="w-1/12 text-black font-bold">Details</TableHead>
                    <TableHead className="w-3/12 text-black font-bold">Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="striped">
                {entity.Attributes.map((attribute) =>
                    <TableRow key={attribute.SchemaName}>
                        <TableCell>{attribute.DisplayName}</TableCell>
                        <TableCell>{attribute.SchemaName}</TableCell>
                        <TableCell>{GetAttributeComponent(entity, attribute, onSelect)}</TableCell>
                        <TableCell>{GetDetailsComponent(attribute)}</TableCell>
                        <TableCell>{attribute.Description}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>

        {entity.Relationships.length > 0 && <Relationships entity={entity} onSelect={onSelect} />}
    </div>
}

function GetTooltipIcon(icon: JSX.Element, text: string) {
    return <Tooltip key={text}><TooltipTrigger asChild>{icon}</TooltipTrigger><TooltipContent><p>{text}</p></TooltipContent></Tooltip>
}

function GetDepthIcon(depth: PrivilegeDepth) {
    switch (depth) {
        case PrivilegeDepth.None: return GetTooltipIcon(<Ban />, "None");
        case PrivilegeDepth.Basic: return GetTooltipIcon(<User />, "User");
        case PrivilegeDepth.Local: return GetTooltipIcon(<Users />, "Business Unit");
        case PrivilegeDepth.Deep: return GetTooltipIcon(<Boxes />, "Parent: Child Business Units");
        case PrivilegeDepth.Global: return GetTooltipIcon(<Building2 />, "Organization");
    }
}

function GetEntityDetails(entity: EntityType) {
    const details: JSX.Element[] = []
    if (entity.IsAuditEnabled) {
        details.push(GetTooltipIcon(<Eye />, "Audit Enabled"))
    }

    if (entity.IsActivity) {
        details.push(GetTooltipIcon(<ClipboardList />, "Is Activity"))
    }

    if (entity.IsNotesEnabled) {
        details.push(GetTooltipIcon(<Paperclip />, "Notes Enabled"))
    }

    switch (entity.Ownership) {
        case OwnershipType.OrganizationOwned:
            details.push(GetTooltipIcon(<Building />, "Organization Owned"))
            break;
        case OwnershipType.UserOwned:
        case OwnershipType.TeamOwned:
            details.push(GetTooltipIcon(<Users />, "User/Team Owned"))
            break;
    }

    return <div className="flex flex-row gap-1 py-1">{details}</div>;
}

function GetDetailsComponent(attribute: AttributeType) {
    const details: JSX.Element[] = []
    switch (attribute.RequiredLevel) {
        case RequiredLevel.None:
            break;
        case RequiredLevel.SystemRequired:
        case RequiredLevel.ApplicationRequired:
            details.push(<Tooltip key={`${attribute.SchemaName}required`}><TooltipTrigger asChild><CircleAlert /></TooltipTrigger><TooltipContent><p>Required</p></TooltipContent></Tooltip>)
            break;
        case RequiredLevel.Recommended:
            details.push(<Tooltip key={`${attribute.SchemaName}recommended`}><TooltipTrigger asChild><CirclePlus /></TooltipTrigger><TooltipContent><p>Recommended</p></TooltipContent></Tooltip>)
            break;
    }

    if (attribute.IsAuditEnabled) {
        details.push(<Tooltip key={`${attribute.SchemaName}audit`}><TooltipTrigger asChild><Eye /></TooltipTrigger><TooltipContent><p>Audit Enabled</p></TooltipContent></Tooltip>)
    }

    if (attribute.IsColumnSecured) {
        details.push(<Tooltip key={`${attribute.SchemaName}lock`}><TooltipTrigger asChild><Lock /></TooltipTrigger><TooltipContent><p>Field Security</p></TooltipContent></Tooltip>)
    }

    return <div className="flex flex-row gap-1">{details}</div>;
}

function GetAttributeComponent(entity: EntityType, attribute: AttributeType, onSelect: (entity: string) => void) {
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
}

export default Section