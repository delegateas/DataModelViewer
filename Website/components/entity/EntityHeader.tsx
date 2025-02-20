'use client'

import { EntityType } from "@/lib/Types";
import { Link } from "lucide-react";
import { EntityDetails } from "./EntityDetails";

export function EntityHeader({ entity }: { entity: EntityType }) {
    return (
        <div className="min-w-0">
            <a className="flex flex-row gap-2 items-center hover:underline" href={`?selected=${entity.SchemaName}`}>
                {entity.IconBase64 == null ? <Link className="h-4 w-4" /> : <img className="h-4 w-4" src={`data:image/svg+xml;base64,${entity.IconBase64}`} />}
                <h2 className="text-xl break-all">{entity.DisplayName} ({entity.SchemaName})</h2>
            </a>
            <EntityDetails entity={entity} />
            <p className="my-4 break-words">{entity.Description}</p>
        </div>
    );
}