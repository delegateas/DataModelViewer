import { AttributeType } from "@/lib/Types";

interface IEntityAttribute {
    attribute: AttributeType;
}

export const EntityAttribute = ({ attribute }: IEntityAttribute): string => {
    const portId = `port-${attribute.SchemaName.toLowerCase()}`;
    return `
        <div
            class="w-full rounded-sm my-[4px] p-[4px] bg-gray-100 flex items-center h-[28px]"
        >
            <p class="text-xs">${attribute.DisplayName}</p>
        </div>
    `;
}