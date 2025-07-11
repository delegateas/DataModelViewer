import { GenericAttributeType } from "@/lib/Types";

export default function GenericAttribute({ attribute } : { attribute: GenericAttributeType }) {
    return <span className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Type}</span>
}