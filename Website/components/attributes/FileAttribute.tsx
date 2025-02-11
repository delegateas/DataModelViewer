import { FileAttributeType } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";

export default function FileAttribute({ attribute } : { attribute: FileAttributeType }) {
    return <>File (Max {formatNumberSeperator(attribute.MaxSize)}KB)</>
}