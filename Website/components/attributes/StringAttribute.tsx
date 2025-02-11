'use client'

import { StringAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";

export default function StringAttribute({ attribute } : { attribute: StringAttributeType }) {
    return <>Text ({formatNumberSeperator(attribute.MaxLength)}){attribute.Format !== "Text" ? ` - ${attribute.Format}` : ""}</>;
}