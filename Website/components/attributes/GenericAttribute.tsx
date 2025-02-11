import { GenericAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function GenericAttribute({ attribute } : { attribute: GenericAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell>{attribute.Type}</TableCell>
        <TableCell>{attribute.Description}</TableCell>
        </TableRow>
}