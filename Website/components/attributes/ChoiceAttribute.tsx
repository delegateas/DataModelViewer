import { ChoiceAttributeType } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function ChoiceAttribute({ attribute }: { attribute: ChoiceAttributeType }) {
    return (
        <>
            <TableRow className="hidden md:table-row">
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
                                <p>{option.Value}{GetColorBox(option.Color)}</p>
                                {option.Description && <p className="col-span-2 italic">{option.Description}</p>}
                            </div>)}
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
                        <span className="card-value">{attribute.Type}-select</span>
                    </div>
                    {attribute.Options.map(option => (
                        <div className="card-row" key={option.Value}>
                            <span className="card-label">{option.Name}{option.Value == attribute.DefaultValue ? " (Default)" : ""}:</span>
                            <span className="card-value">{option.Value}{GetColorBox(option.Color)}</span>
                            {option.Description && <span className="card-value italic">{option.Description}</span>}
                        </div>
                    ))}
                    <div className="card-row">
                        <span className="card-label">Description:</span>
                        <span className="card-value">{attribute.Description}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

function GetColorBox(color: string | null) {
    if (color == null) return null

    return <span className="px-2 ml-2" style={{backgroundColor: color}}></span>
}
