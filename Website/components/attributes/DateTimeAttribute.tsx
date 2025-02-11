import { DateTimeAttributeType } from "@/lib/Types";

export default function DateTimeAttribute({ attribute } : { attribute: DateTimeAttributeType }) {
    return <>{attribute.Format} - {attribute.Behavior}</>
}