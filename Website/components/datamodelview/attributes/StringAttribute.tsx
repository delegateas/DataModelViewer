'use client'

import { StringAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";
import { Typography } from "@mui/material";

export default function StringAttribute({ attribute } : { attribute: StringAttributeType }) {
    return (
        <>
            <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">Text</Typography>
            {" "}
            <Typography component="span" className="text-xs md:text-sm">
                ({formatNumberSeperator(attribute.MaxLength)}){attribute.Format !== "Text" ? ` - ${attribute.Format}` : ""}
            </Typography>
        </>
    );
}