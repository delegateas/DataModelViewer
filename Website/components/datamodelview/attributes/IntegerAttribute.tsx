import { IntegerAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"

export default function IntegerAttribute({ attribute } : { attribute: IntegerAttributeType }) {
    return <><span className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Format}</span> <span className="text-xs md:text-sm">({FormatNumber(attribute.MinValue)} to {FormatNumber(attribute.MaxValue)})</span></>
}

function FormatNumber(number: number) {
    if (number === 2147483647)
        return "Max"
    if (number === -2147483648)
        return "Min"
    return formatNumberSeperator(number)
}