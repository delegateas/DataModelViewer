import { ChoiceAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"
import { CheckCircle, Circle, Square, CheckSquare } from "lucide-react"

export default function ChoiceAttribute({ attribute }: { attribute: ChoiceAttributeType }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-bold">{attribute.Type}-select</span>
                {attribute.DefaultValue !== null && attribute.DefaultValue !== -1 && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Default: {attribute.Options.find(o => o.Value === attribute.DefaultValue)?.Name}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                {attribute.Options.map(option => (
                    <div key={option.Value}>
                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {attribute.Type === "Multi" ? (
                                        // For multi-select, show checkboxes
                                        option.Value === attribute.DefaultValue ? (
                                            <CheckSquare className="w-3 h-3 text-green-600" />
                                        ) : (
                                            <Square className="w-3 h-3 text-gray-400" />
                                        )
                                    ) : (
                                        // For single-select, show radio buttons
                                        option.Value === attribute.DefaultValue ? (
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                        ) : (
                                            <Circle className="w-3 h-3 text-gray-400" />
                                        )
                                    )}
                                    <span className="text-sm">{option.Name}</span>
                                </div>
                                {option.Color && (
                                    <div 
                                        className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" 
                                        style={{ backgroundColor: option.Color }}
                                        title={`Color: ${option.Color}`}
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                                    {formatNumberSeperator(option.Value)}
                                </span>
                            </div>
                        </div>
                        {option.Description && (
                            <div className="text-xs text-gray-600 italic pl-6 break-words">
                                {option.Description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}