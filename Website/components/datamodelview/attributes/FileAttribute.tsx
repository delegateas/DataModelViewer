import { FileAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";
import { Typography } from "@mui/material";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return (
        <>
            <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">File</Typography>
            {" "}
            <Typography component="span" className="text-xs md:text-sm">(Max {formatNumberSeperator(attribute.MaxSize)}KB)</Typography>
        </>
    )
}