import { EntityType } from "@/lib/Types"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table"
import { Button } from "./ui/button"
import { CascadeConfiguration } from "./entity/CascadeConfiguration"

function Relationships({ entity, onSelect }: { entity: EntityType, onSelect: (entity: string) => void }) {
    return <>
        <h2 className="mt-4 mb-1 font-bold">Relationships</h2>
        <div className="overflow-x-auto">
            <Table className="border w-full">
                <TableHeader>
                    <TableRow className="bg-gray-100">
                        <TableHead className="w-[15%] text-black font-bold">Name</TableHead>
                        <TableHead className="w-[15%] text-black font-bold">Related Table</TableHead>
                        <TableHead className="w-[15%] text-black font-bold">Lookup Field</TableHead>
                        <TableHead className="w-[10%] text-black font-bold">Type</TableHead>
                        <TableHead className="w-[25%] text-black font-bold">Behavior</TableHead>
                        <TableHead className="w-[20%] text-black font-bold">Schema Name</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="striped">
                    {entity.Relationships.map((relationship) =>
                        <TableRow key={relationship.RelationshipSchema}>
                            <TableCell className="break-words">{relationship.Name}</TableCell>
                            <TableCell>
                                <Button
                                    key={relationship.TableSchema}
                                    variant="ghost"
                                    className="p-0 text-base text-blue-600 underline dark:text-blue-500 hover:no-underline break-words"
                                    onClick={() => onSelect(relationship.TableSchema)}>
                                    {relationship.TableSchema}
                                </Button>
                            </TableCell>
                            <TableCell className="break-words">{relationship.LookupDisplayName}</TableCell>
                            <TableCell>{relationship.IsManyToMany ? "N:N" : "1:N"}</TableCell>
                            <TableCell><CascadeConfiguration config={relationship.CascadeConfiguration} /></TableCell>
                            <TableCell className="break-words">{relationship.RelationshipSchema}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </>
}

export default Relationships;