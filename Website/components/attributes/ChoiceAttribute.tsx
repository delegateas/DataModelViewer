import { ChoiceAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"

export default function ChoiceAttribute({ attribute }: { attribute: ChoiceAttributeType }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-bold">{attribute.Type}-select</span>
                {attribute.DefaultValue !== null && attribute.DefaultValue !== -1 && (
                    <span className="text-gray-500 text-sm">
                        (Default: {attribute.Options.find(o => o.Value === attribute.DefaultValue)?.Name})
                    </span>
                )}
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 pl-4">
                {attribute.Options.map(option => (
                    <div key={option.Value} className="contents">
                        <div className="flex items-center gap-2">
                            <span>{option.Name}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <span>{formatNumberSeperator(option.Value)}</span>
                            {option.Color && (
                                <span className="w-4 h-4" style={{ backgroundColor: option.Color }}></span>
                            )}
                        </div>
                        {option.Description && (
                            <div className="col-span-2 text-sm text-gray-500 italic pl-4 break-words">
                                {option.Description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}