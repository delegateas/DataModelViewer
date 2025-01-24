import { DateTimeAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function DateTimeAttribute({ attribute } : { attribute: DateTimeAttributeType }) {
    return (
        <>
            <TableRow className="hidden md:table-row">
                <TableCell>{attribute.DisplayName}</TableCell>
                <TableCell>{attribute.SchemaName}</TableCell>
                <TableCell>{attribute.Format} - {attribute.Behavior}</TableCell>
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
                        <span className="card-label">Behavior:</span>
                        <span className="card-value">{attribute.Behavior}</span>
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
