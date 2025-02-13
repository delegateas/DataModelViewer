import { EntityType, CascadeConfigurationType, CascadeType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table"
import { Button } from "./ui/button"

function Relationships({ entity, onSelect }: { entity: EntityType, onSelect: (entity: string) => void }) {
    return <>
    <h2 className="mt-4 mb-1 font-bold">Relationships</h2>
    <Table className="border">
        <TableHeader>
            <TableRow className="bg-gray-100">
                <TableHead className="w-1/6">Name</TableHead>
                <TableHead className="w-1/6">Related Table</TableHead>
                <TableHead className="w-1/6">Lookup Field</TableHead>
                <TableHead className="w-1/6">Schema Name</TableHead>
                <TableHead className="w-1/12">Type</TableHead>
                <TableHead className="w-3/12">Behavior</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody className="striped">
            {entity.Relationships.map((relationship) =>
                <TableRow key={relationship.RelationshipSchema}>
                    <TableCell>{relationship.Name}</TableCell>
                    <TableCell>{<Button
                            key={relationship.TableSchema}
                            variant="ghost"
                            className="p-0 text-base text-blue-600 underline dark:text-blue-500 hover:no-underline"
                            onClick={() => onSelect(relationship.TableSchema)}>{relationship.TableSchema}</Button>}</TableCell>
                    <TableCell>{relationship.LookupDisplayName}</TableCell>
                    <TableCell>{relationship.RelationshipSchema}</TableCell>
                    <TableCell>{relationship.IsManyToMany ? "N:N" : "1:N"}</TableCell>
                    <TableCell>{GetCascadeConfiguration(relationship.CascadeConfiguration)}</TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
    </>
}


function GetCascadeConfiguration(config: CascadeConfigurationType | null): JSX.Element {
    if (!config) {
        return <span>None</span>
    }

    if (config.Assign === CascadeType.None &&
        config.Delete === CascadeType.RemoveLink &&
        config.Merge === CascadeType.None &&
        config.Reparent === CascadeType.None &&
        config.Share === CascadeType.None &&
        config.Unshare === CascadeType.None) {
        return <span>Referential</span>
    }
    
    if (config.Assign === CascadeType.None &&
        config.Delete === CascadeType.Restrict &&
        config.Merge === CascadeType.None &&
        config.Reparent === CascadeType.None &&
        config.Share === CascadeType.None &&
        config.Unshare === CascadeType.None) {
        return <span>Referential, Restrict Delete</span>
    }

    if (config.Assign === CascadeType.Cascade &&
        config.Delete === CascadeType.Cascade &&
        config.Merge === CascadeType.None &&
        config.Reparent === CascadeType.Cascade &&
        config.Share === CascadeType.Cascade &&
        config.Unshare === CascadeType.Cascade) {
        return <span>Parential</span>
    }

    return (
        <ul>
            <li>Assign: {CascadeType[config.Assign]}</li>
            <li>Reparent: {CascadeType[config.Reparent]}</li>
            <li>Delete: {CascadeType[config.Delete]}</li>
            <li>Share: {CascadeType[config.Share]}</li>
            <li>Unshare: {CascadeType[config.Unshare]}</li>
            <li>Merge: {CascadeType[config.Merge]}</li>
        </ul>
    )
}

export default Relationships;