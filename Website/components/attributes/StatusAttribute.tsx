import { StatusAttributeType, StatusOption } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"
import { formatNumberSeperator } from "@/lib/utils"

export default function StatusAttribute({ attribute }: { attribute: StatusAttributeType }) {
    const groupedOptions = attribute.Options.reduce((acc, option) => {
        if (!acc[option.State]) {
            acc[option.State] = []
        }
        acc[option.State].push(option)
        return acc
    }, {} as Record<string, StatusOption[]>)

    return <TableRow>
        <TableCell>{attribute.DisplayName}</TableCell>
        <TableCell>{attribute.SchemaName}</TableCell>
        <TableCell className="flex flex-col">
            {groupedOptions && Object.keys(groupedOptions).map(state =>
                <div className="grid grid-cols-2 mb-4 gap-y-1" key={state}>
                    <p className="font-bold col-span-2">{state}</p>
                    <p className="font-bold">Name</p>
                    <p className="font-bold">Value</p>
                    {groupedOptions[state].map(option =>
                        <div className="contents" key={option.Value}>
                            <p>{option.Name}</p>
                            <p>{formatNumberSeperator(option.Value)}</p>
                        </div>)}
                </div>)}
        </TableCell>
        <TableCell>{attribute.Description}</TableCell>
    </TableRow>
}