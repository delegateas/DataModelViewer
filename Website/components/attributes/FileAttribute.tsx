import { FileAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell>File (Max {attribute.MaxSize}KB)</TableCell>
        <TableCell>{attribute.Description}</TableCell>
        </TableRow>
}