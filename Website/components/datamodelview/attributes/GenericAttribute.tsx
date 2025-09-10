import { GenericAttributeType } from "@/lib/Types";
import { Typography } from "@mui/material";

export default function GenericAttribute({ attribute } : { attribute: GenericAttributeType }) {
    return <Typography component="span" className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Type}</Typography>
}