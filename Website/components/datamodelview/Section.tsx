'use client'

import { EntityType, GroupType } from "@/lib/Types"
import { EntityHeader } from "./entity/EntityHeader"
import { SecurityRoles } from "./entity/SecurityRoles"
import Keys from "./Keys"
import { KeyRound, Tags, Unplug } from "lucide-react"
import { Attributes } from "./Attributes"
import { Relationships } from "./Relationships"
import React from "react"
import { Box, Paper, Tab, Tabs } from "@mui/material"

interface ISectionProps {
    entity: EntityType;
    group: GroupType;
    onContentChange?: () => void;
    onTabChange?: (isChanging: boolean) => void;
    search?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, className, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={className}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export const Section = React.memo(
    ({ entity, group, onContentChange, onTabChange, search }: ISectionProps) => {
        // Use useRef to track previous props for comparison
        const prevSearch = React.useRef(search);
        
        const [tab, setTab] = React.useState(0);
        
        // Handle tab changes to notify parent component
        const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
            if (onTabChange) {
                onTabChange(true);
            }
            setTab(newValue);
        }, [onTabChange]);
        
        // Only compute these counts when needed
        const visibleAttributeCount = React.useMemo(() => entity.Attributes.length, [entity.Attributes]);
        const visibleRelationshipCount = React.useMemo(() => entity.Relationships.length, [entity.Relationships]);
        const visibleKeyCount = React.useMemo(() => entity.Keys.length, [entity.Keys]);

        // Only call onContentChange when something actually changes
        React.useEffect(() => {
            if (onContentChange && 
                (prevSearch.current !== search || 
                 tab !== 0)) {
                prevSearch.current = search;
                onContentChange();
            }
        }, [tab, search, onContentChange]);

        return (
            <div id={entity.SchemaName} data-group={group.Name} className="mb-10">
                <Paper className="rounded-lg" sx={{ backgroundColor: 'background.paper' }} variant="outlined">
                    <Box className="flex flex-col xl:flex-row min-w-0 p-6">
                        <EntityHeader entity={entity} />
                        {entity.SecurityRoles.length > 0 && (
                            <div className="md:w-full xl:w-2/3 xl:pl-6 xl:border-l md:border-t xl:border-t-0 border-gray-100 mt-6 xl:mt-0 pt-6 xl:pt-0">
                                <SecurityRoles roles={entity.SecurityRoles} />
                            </div>
                        )}
                    </Box>

                    <Box className="px-6 pb-6">
                        <Paper className="rounded-lg" variant="outlined">
                            <Tabs 
                                value={tab} 
                                onChange={handleTabChange}
                                className="border-b"
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    borderColor: 'border.main',
                                }}
                            >
                                <Tab 
                                    label={
                                        <div className="flex items-center min-w-[120px] sm:min-w-[140px] px-2 py-1 text-xs sm:text-sm">
                                            <Tags className="mr-2 h-4 w-4 shrink-0" />
                                            <span className="truncate">Attributes [{visibleAttributeCount}]</span>
                                        </div>
                                    }
                                />
                                {entity.Relationships.length > 0 && (
                                    <Tab 
                                        label={
                                            <div className="flex items-center min-w-[140px] sm:min-w-[160px] px-2 py-1 text-xs sm:text-sm">
                                                <Unplug className="mr-2 h-4 w-4 shrink-0" />
                                                <span className="truncate">Relationships [{visibleRelationshipCount}]</span>
                                            </div>
                                        }
                                    />
                                )}
                                {entity.Keys.length > 0 && (
                                    <Tab 
                                        label={
                                            <div className="flex items-center min-w-[100px] sm:min-w-[120px] px-2 py-1 text-xs sm:text-sm">
                                                <KeyRound className="mr-2 h-4 w-4 shrink-0" />
                                                <span className="truncate">Keys [{visibleKeyCount}]</span>
                                            </div>
                                        }
                                    />
                                )}
                            </Tabs>
                            
                            <CustomTabPanel value={tab} index={0} className="m-0 p-0">
                                <Attributes entity={entity} search={search} />
                            </CustomTabPanel>
                            {entity.Relationships.length > 0 && (
                                <CustomTabPanel value={tab} index={entity.Keys.length > 0 ? 1 : 1} className="m-0 p-0">
                                    <Relationships entity={entity} search={search} />
                                </CustomTabPanel>
                            )}
                            {entity.Keys.length > 0 && (
                                <CustomTabPanel 
                                    value={tab} 
                                    index={entity.Relationships.length > 0 ? 2 : 1} 
                                    className="m-0 p-0"
                                >
                                    <Keys entity={entity} search={search} />
                                </CustomTabPanel>
                            )}
                        </Paper>
                    </Box>
                </Paper>
            </div>
        )
    },
    // Custom comparison function to prevent unnecessary re-renders
    (prevProps, nextProps) => {
        // Only re-render if entity, search or group changes
        return prevProps.entity.SchemaName === nextProps.entity.SchemaName && 
               prevProps.search === nextProps.search && 
               prevProps.group.Name === nextProps.group.Name;
    }
);

Section.displayName = "Section";