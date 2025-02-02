import { StringAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function StringAttribute({ attribute } : { attribute: StringAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell>Text ({attribute.MaxLength}){attribute.Format !== "Text" ? ` - ${attribute.Format}` : ""}</TableCell>
        <TableCell>{attribute.Description}</TableCell>
        </TableRow>
}