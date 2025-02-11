import { GenericAttributeType } from "@/lib/Types";

export default function GenericAttribute({ attribute } : { attribute: GenericAttributeType }) {
    return <>{attribute.Type}</>
}