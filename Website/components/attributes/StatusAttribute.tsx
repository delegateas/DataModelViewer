import { StatusAttributeType, StatusOption } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"

export default function StatusAttribute({ attribute }: { attribute: StatusAttributeType }) {
    const groupedOptions = attribute.Options.reduce((acc, option) => {
        if (!acc[option.State]) {
            acc[option.State] = []
        }
        acc[option.State].push(option)
        return acc
    }, {} as Record<string, StatusOption[]>)

    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold">State/Status</span>
            {Object.entries(groupedOptions).map(([state, options]) => (
                <div key={state} className="flex flex-col gap-1">
                    <span className="font-medium">{state}</span>
                    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 pl-4">
                        {options.map(option => (
                            <div key={option.Value} className="contents">
                                <span>{option.Name}</span>
                                <span>{formatNumberSeperator(option.Value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}