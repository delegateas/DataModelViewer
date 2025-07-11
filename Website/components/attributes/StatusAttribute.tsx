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
        <div className="flex flex-col gap-2 md:gap-4">
            <span className="font-semibold text-xs md:font-bold md:text-sm">State/Status</span>
            {Object.entries(groupedOptions).map(([state, options]) => (
                <div key={state} className="flex flex-col gap-1">
                    <span className="font-medium text-xs md:text-sm">{state}</span>
                    <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 pl-2 md:gap-x-4 md:pl-4">
                        {options.map(option => (
                            <div key={option.Value} className="contents">
                                <span className="text-xs md:text-sm">{option.Name}</span>
                                <span className="text-right text-xs md:text-sm">{formatNumberSeperator(option.Value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}