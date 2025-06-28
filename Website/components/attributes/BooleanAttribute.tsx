import { BooleanAttributeType } from "@/lib/Types"
import { CheckCircle, Circle } from "lucide-react"

export default function BooleanAttribute({ attribute }: { attribute: BooleanAttributeType }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-bold">Boolean</span>
                {attribute.DefaultValue !== null && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Default: {attribute.DefaultValue === true ? attribute.TrueLabel : attribute.FalseLabel}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1">
                        {attribute.DefaultValue === true ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                            <Circle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-sm">{attribute.TrueLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                            True
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1">
                        {attribute.DefaultValue === false ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                            <Circle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-sm">{attribute.FalseLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                            False
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}