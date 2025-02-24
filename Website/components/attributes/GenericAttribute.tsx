import { GenericAttributeType } from "@/lib/Types";

export default function GenericAttribute({ attribute } : { attribute: GenericAttributeType }) {
    return <span className="font-bold">{attribute.Type}</span>
}