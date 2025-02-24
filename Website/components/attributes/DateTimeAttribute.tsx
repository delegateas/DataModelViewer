import { DateTimeAttributeType } from "@/lib/Types";

export default function DateTimeAttribute({ attribute } : { attribute: DateTimeAttributeType }) {
    return <><span className="font-bold">{attribute.Format}</span> - {attribute.Behavior}</>
}