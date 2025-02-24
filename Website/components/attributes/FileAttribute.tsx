import { FileAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return <><span className="font-bold">File</span> (Max {formatNumberSeperator(attribute.MaxSize)}KB)</>
}