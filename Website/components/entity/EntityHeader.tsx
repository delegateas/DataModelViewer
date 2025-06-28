'use client'

import { EntityType } from "@/lib/Types";
import { Link } from "lucide-react";
import { EntityDetails } from "./EntityDetails";

export function EntityHeader({ entity }: { entity: EntityType }) {
    return (
        <div className="min-w-0 xl:w-1/3 w-full xl:pr-6">
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0">
                    {entity.IconBase64 == null ? 
                        <Link className="h-6 w-6 text-gray-600" /> : 
                        <img className="h-6 w-6" src={`data:image/svg+xml;base64,${entity.IconBase64}`} />
                    }
                </div>
                <div className="min-w-0">
                    <a 
                        className="group flex items-center gap-2 hover:no-underline flex-wrap" 
                        href={`?selected=${entity.SchemaName}`}
                    >
                        <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {entity.DisplayName}
                        </h2>
                        <span className="text-sm text-gray-500 font-mono">
                            {entity.SchemaName}
                        </span>
                    </a>
                </div>
            </div>
            
            <div className="mb-4">
                <EntityDetails entity={entity} />
            </div>

            {entity.Description && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-600 leading-relaxed">
                        {entity.Description}
                    </p>
                </div>
            )}
        </div>
    );
}