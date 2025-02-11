import { FileAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return (
        <>
            <TableRow className="hidden md:table-row">
                <TableCell>{attribute.DisplayName}</TableCell>
                <TableCell>{attribute.SchemaName}</TableCell>
                <TableCell>File (Max {attribute.MaxSize}KB)</TableCell>
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
                        <span className="card-value">File</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Max Size:</span>
                        <span className="card-value">{attribute.MaxSize}KB</span>
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
