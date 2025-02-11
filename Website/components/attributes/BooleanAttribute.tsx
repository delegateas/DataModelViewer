import { BooleanAttributeType } from "@/lib/Types"

export default function ChoiceAttribute({ attribute }: { attribute: BooleanAttributeType }) {
    return <div className="grid grid-cols-2 mb-2">
        <p className="col-span-2 font-bold">Boolean</p>
        <p>{attribute.TrueLabel}</p>
        <p>True{attribute.DefaultValue === true ? " (Default)" : ""}</p>
        <p>{attribute.FalseLabel}</p>
        <p>False{attribute.DefaultValue === false ? " (Default)" : ""}</p>
    </div>
}