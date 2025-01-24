import { GenericAttributeType } from "@/lib/Types";
import { TableCell, TableRow } from "../ui/table";

export default function GenericAttribute({ attribute } : { attribute: GenericAttributeType }) {
    return (
        <>
            <TableRow className="hidden md:table-row">
                <TableCell>{attribute.DisplayName}</TableCell>
                <TableCell>{attribute.SchemaName}</TableCell>
                <TableCell>Generic {attribute.Type}</TableCell>
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
                        <span className="card-value">Generic {attribute.Type}</span>
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
