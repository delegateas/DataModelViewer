import { DateTimeAttributeType } from "@/lib/Types";
import { Typography } from "@mui/material";

export default function DateTimeAttribute({ attribute } : { attribute: DateTimeAttributeType }) {
    return (
        <>
            <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Format}</Typography>
            {" - "}
            <Typography component="span" className="text-xs md:text-sm">{attribute.Behavior}</Typography>
        </>
    )
}