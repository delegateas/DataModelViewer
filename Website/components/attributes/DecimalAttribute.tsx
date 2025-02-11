import { DecimalAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"
import { formatNumberSeperator } from "@/lib/utils"

export default function MoneyAttribute({ attribute }: { attribute: DecimalAttributeType}) {
    const formatNumber =
        attribute.Type === "Money" 
        ? FormatMoney 
        : FormatDecimal

    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell className="flex flex-col">
            <p>{attribute.Type} ({formatNumber(attribute.MinValue)} to {formatNumber(attribute.MaxValue)})</p>
            <p>Precision: {attribute.Precision}</p>
        </TableCell>
        <TableCell>{attribute.Description}</TableCell>
    </TableRow>
}

function FormatMoney(number: number) {
    if (number === 922337203685477)
        return "Max"
    if (number === -922337203685477)
        return "Min"
    return formatNumberSeperator(number)
}

function FormatDecimal(number: number) {
    if (number === 100000000000)
        return "Max"
    if (number === -100000000000)
        return "Min"
    return formatNumberSeperator(number)
}