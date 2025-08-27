import { FileAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return <><span className="font-semibold text-xs md:font-bold md:text-sm">File</span> <span className="text-xs md:text-sm">(Max {formatNumberSeperator(attribute.MaxSize)}KB)</span></>
}