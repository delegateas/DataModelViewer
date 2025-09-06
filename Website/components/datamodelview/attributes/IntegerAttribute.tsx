import { IntegerAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"
import { Typography } from "@mui/material"

export default function IntegerAttribute({ attribute } : { attribute: IntegerAttributeType }) {
    return (
        <>
            <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Format}</Typography>
            {" "}
            <Typography component="span" className="text-xs md:text-sm">({FormatNumber(attribute.MinValue)} to {FormatNumber(attribute.MaxValue)})</Typography>
        </>
    )
}

function FormatNumber(number: number) {
    if (number === 2147483647)
        return "Max"
    if (number === -2147483648)
        return "Min"
    return formatNumberSeperator(number)
}