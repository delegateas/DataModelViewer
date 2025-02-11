import { ChoiceAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"
import { formatNumberSeperator } from "@/lib/utils"

export default function ChoiceAttribute({ attribute }: { attribute: ChoiceAttributeType }) {
    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell className="flex flex-col">
            <div className="grid grid-cols-[auto_1] mb-1 gap-y-1">
                <p className="col-span-2">{attribute.Type}-select</p>
                <p className="font-bold">Name</p>
                <p className="font-bold">Value</p>
                {attribute.Options.map(option =>
                    <div className="contents" key={option.Value}>
                        <p>{option.Name}{option.Value == attribute.DefaultValue ? " (Default)" : ""}</p>
                        <p>{formatNumberSeperator(option.Value)}{GetColorBox(option.Color)}</p>
                        {option.Description && <p className="col-span-2 italic">{option.Description}</p>}
                    </div>)}
            </div>
        </TableCell>
        <TableCell>{attribute.Description}</TableCell>
    </TableRow>
}

function GetColorBox(color: string | null) {
    if (color == null) return null

    return <span className="px-2 ml-2" style={{backgroundColor: color}}></span>
}