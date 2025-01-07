import { BooleanAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function ChoiceAttribute({ attribute }: { attribute: BooleanAttributeType}) {
    return <TableRow>
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
}