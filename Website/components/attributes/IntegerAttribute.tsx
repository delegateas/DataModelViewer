import { IntegerAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function IntegerAttribute({ attribute } : { attribute: IntegerAttributeType }) {
    return (
        <>
            <TableRow className="hidden md:table-row">
                <TableCell>{attribute.DisplayName}</TableCell>
                <TableCell>{attribute.SchemaName}</TableCell>
                <TableCell>{attribute.Format} ({FormatNumber(attribute.MinValue)} to {FormatNumber(attribute.MaxValue)})</TableCell>
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
                        <span className="card-label">Format:</span>
                        <span className="card-value">{attribute.Format}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Min Value:</span>
                        <span className="card-value">{FormatNumber(attribute.MinValue)}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Max Value:</span>
                        <span className="card-value">{FormatNumber(attribute.MaxValue)}</span>
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

function FormatNumber(number: number) {
    if (number === 2147483647)
        return "Max"
    if (number === -2147483648)
        return "Min"
    return number
}
