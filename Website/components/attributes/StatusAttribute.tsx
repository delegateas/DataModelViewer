import { useIsMobile } from "@/hooks/use-mobile";
import { StatusAttributeType, StatusOption } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

export default function StatusAttribute({ attribute }: { attribute: StatusAttributeType }) {
    const isMobile = useIsMobile();
    const groupedOptions = attribute.Options.reduce((acc, option) => {
        if (!acc[option.State]) {
            acc[option.State] = [];
        }
        acc[option.State].push(option);
        return acc;
    }, {} as Record<string, StatusOption[]>);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-xs md:font-bold md:text-sm">State/Status</span>
                {/* No DefaultValue for StatusAttributeType, so no default badge */}
            </div>
            {Object.entries(groupedOptions).map(([state, options]) => (
                <div key={state} className="flex flex-col gap-1">
                    <span className="font-medium text-xs md:text-sm">{state}</span>
                    <div className="space-y-1">
                        {options.map(option => (
                            <div key={option.Value}>
                                <div className="flex items-center justify-between py-0.5 md:py-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {/* No DefaultValue, so always show Circle icon */}
                                            <Circle className="w-2 h-2 text-gray-400 md:w-3 md:h-3" />
                                            <span className="text-xs md:text-sm">{option.Name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded font-mono md:px-1.5">
                                            {formatNumberSeperator(option.Value)}
                                        </span>
                                    </div>
                                </div>
                                {/* No Description property */}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}