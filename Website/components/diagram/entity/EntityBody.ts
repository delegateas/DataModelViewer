import { AttributeType, EntityType } from '@/lib/Types'
import { EntityAttribute } from './EntityAttribute';

interface IEntityBody {
    entity: EntityType;
    visibleItems: AttributeType[];
}

export function EntityBody({ entity, visibleItems }: IEntityBody): string {
            
    const icon = entity.IconBase64 != null
        ? `data:image/svg+xml;base64,${entity.IconBase64}`
        : '/vercel.svg';

    return `
        <div class="w-full p-[16px]">

            <!-- HEADER -->
            <div class="w-full flex items-center h-[48px] mb-[16px]">
                <div class="bg-green-100 p-[16px] rounded-sm mr-2">
                    <img src="${icon}" class="w-[16px] h-[16px]" />
                </div>
                <div class="flex flex-col flex-grow">
                    <h2 class="font-bold font-md">${entity.DisplayName}</h2>
                    <p class="font-sm text-gray-600">${entity.SchemaName}</p>
                </div>
            </div>
            <!-- ATTRIBUTES -->
            <div class="w-full flex flex-col">
                ${visibleItems.map(attribute => (EntityAttribute({ attribute }))).join('')}
            </div>
        </div>
    `;
}
