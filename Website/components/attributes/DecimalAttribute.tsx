import { DecimalAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"

export default function MoneyAttribute({ attribute }: { attribute: DecimalAttributeType }) {
    const formatNumber =
        attribute.Type === "Money"
            ? FormatMoney
            : FormatDecimal

    return <>
        <p><span className="font-bold">{attribute.Type}</span> ({formatNumber(attribute.MinValue)} to {formatNumber(attribute.MaxValue)})</p>
        <p>Precision: {attribute.Precision}</p>
    </>
}

function FormatMoney(number: number) {
    if (number === 922337203685477)
        return "Max"
    if (number === -922337203685477)
        return "Min"
    return formatNumberSeperator(number)
}

function FormatDecimal(number: number) {
    if (number === 100000000000)
        return "Max"
    if (number === -100000000000)
        return "Min"
    return formatNumberSeperator(number)
}