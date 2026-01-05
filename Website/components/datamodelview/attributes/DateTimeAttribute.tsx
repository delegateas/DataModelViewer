import { DateTimeAttributeType } from "@/lib/Types";
import { Typography } from "@mui/material";
import React from "react";

export default function DateTimeAttribute({ attribute, highlightMatch, highlightTerm } : { attribute: DateTimeAttributeType, highlightMatch?: (text: string, term: string) => string | React.JSX.Element, highlightTerm?: string }) {
    return (
        <>
            <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">{highlightMatch && highlightTerm ? highlightMatch(attribute.Format, highlightTerm) : attribute.Format}</Typography>
            {" - "}
            <Typography component="span" className="text-xs md:text-sm">{highlightMatch && highlightTerm ? highlightMatch(attribute.Behavior, highlightTerm) : attribute.Behavior}</Typography>
        </>
    )
}