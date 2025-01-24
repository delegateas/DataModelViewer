import { DecimalAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function MoneyAttribute({ attribute }: { attribute: DecimalAttributeType}) {
    const formatNumber =
        attribute.Type === "Money" 
        ? FormatMoney 
        : FormatDecimal

    return (
        <>
            <TableRow className="hidden md:table-row">
                <TableCell>{attribute.DisplayName}</TableCell>
                <TableCell>{attribute.SchemaName}</TableCell>
                <TableCell className="flex flex-col">
                    <p>{attribute.Type} ({formatNumber(attribute.MinValue)} to {formatNumber(attribute.MaxValue)})</p>
                    <p>Precision: {attribute.Precision}</p>
                </TableCell>
                <TableCell>{attribute.Description}</TableCell>
            </TableRow>
            <div className="card md:hidden">
                <div className="card-header">{attribute.DisplayName}</div>
                <div className="card-content">
                    <div className="card-row">
                        <span className="card-label">Schema Name:</span>
                        <span className="card-value">{attribute.SchemaName}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Type:</span>
                        <span className="card-value">{attribute.Type}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Min Value:</span>
                        <span className="card-value">{formatNumber(attribute.MinValue)}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Max Value:</span>
                        <span className="card-value">{formatNumber(attribute.MaxValue)}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Precision:</span>
                        <span className="card-value">{attribute.Precision}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Description:</span>
                        <span className="card-value">{attribute.Description}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

function FormatMoney(number: number) {
    if (number === 922337203685477)
        return "Max"
    if (number === -922337203685477)
        return "Min"
    return number
}

function FormatDecimal(number: number) {
    if (number === 100000000000)
        return "Max"
    if (number === -100000000000)
        return "Min"
    return number
}
