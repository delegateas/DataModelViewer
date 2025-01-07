import { IntegerAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function IntegerAttribute({ attribute } : { attribute: IntegerAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell>{attribute.Format} ({FormatNumber(attribute.MinValue)} to {FormatNumber(attribute.MaxValue)})</TableCell>
        <TableCell>{attribute.Description}</TableCell>
        </TableRow>
}

function FormatNumber(number: number) {
    if (number === 2147483647)
        return "Max"
    if (number === -2147483648)
        return "Min"
    return number
}