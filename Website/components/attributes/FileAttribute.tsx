import { FileAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";
import { formatNumberSeperator } from "@/lib/utils";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell>File (Max {formatNumberSeperator(attribute.MaxSize)}KB)</TableCell>
        <TableCell>{attribute.Description}</TableCell>
        </TableRow>
}