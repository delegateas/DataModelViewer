import { useIsMobile } from "@/hooks/use-mobile";
import { BooleanAttributeType } from "@/lib/Types"
import { CheckCircle, Circle } from "lucide-react"

export default function BooleanAttribute({ attribute }: { attribute: BooleanAttributeType }) {

    const isMobile = useIsMobile();
    
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-xs md:font-bold md:text-sm">Boolean</span>
                {attribute.DefaultValue !== null && !isMobile && (
                    <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex items-center gap-1 md:px-1.5">
                        <CheckCircle className="w-2 h-2 md:w-3 md:h-3" />
                        Default: {attribute.DefaultValue === true ? attribute.TrueLabel : attribute.FalseLabel}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <div className="flex items-center justify-between py-0.5 md:py-1">
                    <div className="flex items-center gap-1">
                        {attribute.DefaultValue === true ? (
                            <CheckCircle className="w-2 h-2 text-green-600 md:w-3 md:h-3" />
                        ) : (
                            <Circle className="w-2 h-2 text-gray-400 md:w-3 md:h-3" />
                        )}
                        <span className="text-xs md:text-sm">{attribute.TrueLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded font-mono md:px-1.5">
                            True
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between py-0.5 md:py-1">
                    <div className="flex items-center gap-1">
                        {attribute.DefaultValue === false ? (
                            <CheckCircle className="w-2 h-2 text-green-600 md:w-3 md:h-3" />
                        ) : (
                            <Circle className="w-2 h-2 text-gray-400 md:w-3 md:h-3" />
                        )}
                        <span className="text-xs md:text-sm">{attribute.FalseLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded font-mono md:px-1.5">
                            False
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}