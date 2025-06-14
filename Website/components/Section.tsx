'use client'

import { useEffect, useState } from "react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { EntityType } from "@/lib/Types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { EntityHeader } from "./entity/EntityHeader"
import { SecurityRoles } from "./entity/SecurityRoles"
import Relationships from "./Relationships"
import Attributes from "./Attributes"
import { KeyRound, Tags, Unplug } from "lucide-react"

function Section({
    entity,
    selected,
    onSelect
}: {
    entity: EntityType,
    selected: string | null,
    onSelect: (entity: string) => void
}) {
    const isSelected = selected?.toLowerCase() === entity.SchemaName.toLocaleLowerCase()
    const [contentRef, shouldScrollTo] = useScrollTo<HTMLDivElement>()

    useEffect(() => {
        if (isSelected) {
            shouldScrollTo(true)
        }
    }, [isSelected])

    return (
        <div ref={contentRef} className="mb-10">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:justify-between min-w-0">
                    <div className="min-w-0 xl:pr-5">
                        <EntityHeader entity={entity} />
                    </div>
                    {entity.SecurityRoles.length > 0 &&
                        <div className="w-fit border-t xl:border-t-0 xl:border-l xl:px-5 mt-5 pt-5 xl:mt-0 xl:pt-0">
                            <SecurityRoles roles={entity.SecurityRoles} />
                        </div>}
                </div>

                <Tabs defaultValue="attributes">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                        <TabsList className="bg-transparent p-0">
                            <TabsTrigger value="attributes" className="data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                <Tags className="mr-2 h-4 w-4" />Attributes [{entity.Attributes.length}]
                            </TabsTrigger>
                            {entity.Relationships.length ? 
                                <TabsTrigger value="relationships" className="data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                    <Unplug className="mr-2 h-4 w-4" />Relationships [{entity.Relationships.length}]
                                </TabsTrigger> 
                                : <></> 
                            }
                            <TabsTrigger value="keys" className="data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                <KeyRound className="mr-2 h-4 w-4" />Keys [{}]
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="attributes" className="m-0 p-0">
                            <Attributes entity={entity} onSelect={onSelect} />
                        </TabsContent>
                        <TabsContent value="relationships" className="m-0 p-0">
                            <Relationships entity={entity} onSelect={onSelect} />
                        </TabsContent>
                        <TabsContent value="keys" className="m-0 p-0">
                            <div className="p-4 text-gray-500 text-center">No keys available</div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

export default Section