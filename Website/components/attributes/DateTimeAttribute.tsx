import { DateTimeAttributeType } from "@/lib/Types";

export default function DateTimeAttribute({ attribute } : { attribute: DateTimeAttributeType }) {
    return <><span className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Format}</span> - <span className="text-xs md:text-sm">{attribute.Behavior}</span></>
}