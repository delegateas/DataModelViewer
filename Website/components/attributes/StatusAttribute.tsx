import { StatusAttributeType, StatusOption } from "@/lib/Types"
import { TableCell, TableRow } from "../ui/table"

export default function StatusAttribute({ attribute }: { attribute: StatusAttributeType }) {
    const groupedOptions = attribute.Options.reduce((acc, option) => {
        if (!acc[option.State]) {
            acc[option.State] = []
        }
        acc[option.State].push(option)
        return acc
    }, {} as Record<string, StatusOption[]>)

    return (
        <>
            <TableRow className="hidden md:table-row">
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
                                    <p>{option.Value}</p>
                                </div>)}
                        </div>)}
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
                    {groupedOptions && Object.keys(groupedOptions).map(state => (
                        <div key={state}>
                            <div className="card-row">
                                <span className="card-label">{state}:</span>
                            </div>
                            {groupedOptions[state].map(option => (
                                <div className="card-row" key={option.Value}>
                                    <span className="card-label">{option.Name}:</span>
                                    <span className="card-value">{option.Value}</span>
                                </div>
                            ))}
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
