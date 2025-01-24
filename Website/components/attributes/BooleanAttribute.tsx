import { BooleanAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function ChoiceAttribute({ attribute }: { attribute: BooleanAttributeType}) {
    return (
        <>
            <TableRow className="hidden md:table-row">
                <TableCell>{attribute.DisplayName}</TableCell>
                <TableCell>{attribute.SchemaName}</TableCell>
                <TableCell className="flex flex-col">
                    <div className="grid grid-cols-2 mb-2">
                        <p className="col-span-2 font-bold">Boolean</p>
                        <p>{attribute.TrueLabel}</p>
                        <p>True{attribute.DefaultValue === true ? " (Default)" : ""}</p>
                        <p>{attribute.FalseLabel}</p>
                        <p>False{attribute.DefaultValue === false ? " (Default)" : ""}</p>
                    </div>
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
                        <span className="card-value">Boolean</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">True Label:</span>
                        <span className="card-value">{attribute.TrueLabel}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">False Label:</span>
                        <span className="card-value">{attribute.FalseLabel}</span>
                    </div>
                    <div className="card-row">
                        <span className="card-label">Default Value:</span>
                        <span className="card-value">{attribute.DefaultValue ? "True" : "False"}</span>
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
