import { BooleanAttributeType } from "@/lib/Types"

export default function BooleanAttribute({ attribute }: { attribute: BooleanAttributeType }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="font-bold">Boolean</span>
                <span className="text-gray-500 text-sm">
                    (Default: {attribute.DefaultValue === true ? attribute.TrueLabel : attribute.FalseLabel})
                </span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 pl-4">
                <span>{attribute.TrueLabel}</span>
                <span>True</span>
                <span>{attribute.FalseLabel}</span>
                <span>False</span>
            </div>
        </div>
    )
}