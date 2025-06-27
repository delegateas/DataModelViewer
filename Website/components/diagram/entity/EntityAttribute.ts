import { AttributeType } from "@/lib/Types";

interface IEntityAttribute {
    attribute: AttributeType;
    isKey: boolean;
}

export const EntityAttribute = ({ attribute, isKey }: IEntityAttribute): string => {
    return `
        <button
            class="w-full rounded-sm my-[4px] p-[4px] bg-gray-100 flex items-center h-[28px] ${isKey ? 'transition-colors duration-300 hover:bg-blue-200' : ''}"
            data-schema-name="${attribute.SchemaName}"
            data-is-key="${isKey}"
        >
            <p class="text-xs">${attribute.DisplayName}</p>
        </button>
    `;
};