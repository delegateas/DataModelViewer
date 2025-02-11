import { LookupAttributeType } from "@/lib/Types"
import { Button } from "../ui/button"

export default function LookupAttribute({ attribute, onSelect }: { attribute: LookupAttributeType, onSelect: (entity: string) => void }) {
    return <>
        <p className="font-bold">Lookup</p>
        <div className="flex flex-col items-start">
            {attribute.Targets
                .map(target => <Button
                    key={target}
                    variant="ghost"
                    className="p-0 text-base text-blue-600 underline dark:text-blue-500 hover:no-underline"
                    onClick={() => onSelect(target)}>{target}</Button>)}
        </div>
    </>
}