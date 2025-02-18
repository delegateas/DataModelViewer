'use client'

import { EntityType } from "@/lib/Types";
import { Link } from "lucide-react";
import { EntityDetails } from "./EntityDetails";

export function EntityHeader({ entity }: { entity: EntityType }) {
    return (
        <div className="w-full lg:w-1/2 lg:pr-5">
            <a className="flex flex-row gap-2 items-center hover:underline" href={`?selected=${entity.SchemaName}`}>
                <Link />
                <h2 className="text-xl break-all">{entity.DisplayName} ({entity.SchemaName})</h2>
            </a>
            <EntityDetails entity={entity} />
            <p className="my-4">{entity.Description}</p>
        </div>
    );
}