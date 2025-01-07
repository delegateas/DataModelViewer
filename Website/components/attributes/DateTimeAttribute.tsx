import { DateTimeAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function DateTimeAttribute({ attribute } : { attribute: DateTimeAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell>{attribute.Format} - {attribute.Behavior}</TableCell>
        <TableCell>{attribute.Description}</TableCell>
        </TableRow>
}