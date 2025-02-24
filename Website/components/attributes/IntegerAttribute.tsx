import { IntegerAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"

export default function IntegerAttribute({ attribute } : { attribute: IntegerAttributeType }) {
    return <><span className="font-bold">{attribute.Format}</span> ({FormatNumber(attribute.MinValue)} to {FormatNumber(attribute.MaxValue)})</>
}

function FormatNumber(number: number) {
    if (number === 2147483647)
        return "Max"
    if (number === -2147483648)
        return "Min"
    return formatNumberSeperator(number)
}