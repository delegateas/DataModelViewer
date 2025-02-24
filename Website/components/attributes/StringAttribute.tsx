'use client'

import { StringAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";

export default function StringAttribute({ attribute } : { attribute: StringAttributeType }) {
    return <><span className="font-bold">Text</span> ({formatNumberSeperator(attribute.MaxLength)}){attribute.Format !== "Text" ? ` - ${attribute.Format}` : ""}</>;
}