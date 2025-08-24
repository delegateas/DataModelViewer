'use client'

import { StringAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";

export default function StringAttribute({ attribute } : { attribute: StringAttributeType }) {
    return <><span className="font-semibold text-xs md:font-bold md:text-sm">Text</span> <span className="text-xs md:text-sm">({formatNumberSeperator(attribute.MaxLength)}){attribute.Format !== "Text" ? ` - ${attribute.Format}` : ""}</span></>;
}