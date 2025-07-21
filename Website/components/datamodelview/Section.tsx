'use client'

import { EntityType, GroupType } from "@/lib/Types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { EntityHeader } from "../entity/EntityHeader"
import { SecurityRoles } from "../entity/SecurityRoles"
import Keys from "./Keys"
import { KeyRound, Tags, Unplug } from "lucide-react"
import { Attributes } from "./Attributes"
import { Relationships } from "./Relationships"
import React from "react"

interface ISectionProps {
    entity: EntityType;
    group: GroupType;
    onContentChange?: () => void;
    search?: string;
}

export const Section = React.memo(({ entity, group, onContentChange, search }: ISectionProps) => 
    {
        const [tab, setTab] = React.useState("attributes");
        const [visibleAttributeCount, setVisibleAttributeCount] = React.useState(entity.Attributes.length);
        const [visibleRelationshipCount, setVisibleRelationshipCount] = React.useState(entity.Relationships.length);
        const [visibleKeyCount, setVisibleKeyCount] = React.useState(entity.Keys.length);

        React.useEffect(() => {
            onContentChange && onContentChange();
        }, [tab, visibleAttributeCount, visibleRelationshipCount, visibleKeyCount, onContentChange]);

        return (
            <div id={entity.SchemaName} data-group={group.Name} className="mb-10">
                <div className="bg-white rounded-lg border border-gray-300 shadow-md">
                    <div className="flex flex-col xl:flex-row min-w-0 p-6">
                        <EntityHeader entity={entity} />
                        {entity.SecurityRoles.length > 0 && (
                            <div className="md:w-full xl:w-2/3 xl:pl-6 xl:border-l md:border-t xl:border-t-0 border-gray-100 mt-6 xl:mt-0 pt-6 xl:pt-0">
                                <SecurityRoles roles={entity.SecurityRoles} />
                            </div>
                        )}
                    </div>

                    <Tabs defaultValue="attributes" value={tab} onValueChange={setTab}>
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                            <TabsList className="bg-transparent p-0 flex overflow-x-auto no-scrollbar gap-1 sm:gap-2">
                                <TabsTrigger value="attributes" className="flex items-center min-w-[120px] sm:min-w-[140px] px-2 sm:px-4 py-2 text-xs sm:text-sm truncate data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                    <Tags className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Attributes [{visibleAttributeCount}]</span>
                                </TabsTrigger>
                                {entity.Relationships.length ? 
                                    <TabsTrigger value="relationships" className="flex items-center min-w-[140px] sm:min-w-[160px] px-2 sm:px-4 py-2 text-xs sm:text-sm truncate data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                        <Unplug className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">Relationships [{visibleRelationshipCount}]</span>
                                    </TabsTrigger> 
                                    : <></> 
                                }
                                <TabsTrigger value="keys" className="flex items-center min-w-[100px] sm:min-w-[120px] px-2 sm:px-4 py-2 text-xs sm:text-sm truncate data-[state=active]:bg-gray-50 data-[state=active]:shadow-sm transition-all duration-200">
                                    <KeyRound className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Keys [{visibleKeyCount}]</span>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="attributes" className="m-0 p-0">
                                <Attributes entity={entity} onVisibleCountChange={setVisibleAttributeCount} search={search} />
                            </TabsContent>
                            <TabsContent value="relationships" className="m-0 p-0">
                                <Relationships entity={entity} onVisibleCountChange={setVisibleRelationshipCount} search={search} />
                            </TabsContent>
                            <TabsContent value="keys" className="m-0 p-0">
                                <Keys entity={entity} onVisibleCountChange={setVisibleKeyCount} search={search} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        )
    }
);

Section.displayName = "Section";