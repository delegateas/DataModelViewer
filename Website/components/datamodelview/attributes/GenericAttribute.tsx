import { GenericAttributeType } from "@/lib/Types";
import { Typography } from "@mui/material";
import React from "react";

export default function GenericAttribute({ attribute, highlightMatch, highlightTerm } : { attribute: GenericAttributeType, highlightMatch?: (text: string, term: string) => string | React.JSX.Element, highlightTerm?: string }) {
    return <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">{highlightMatch && highlightTerm ? highlightMatch(attribute.Type, highlightTerm) : attribute.Type}</Typography>
}