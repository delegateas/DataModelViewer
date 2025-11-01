'use client';

import React, { useCallback } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';
import {
    ExpandMore,
    OpenInNewRounded,
    ExtensionRounded
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import { cn } from "@/lib/utils";
import { GroupType, EntityType } from "@/lib/Types";

interface EntityGroupAccordionProps {
    group: GroupType;
    isExpanded: boolean;
    onToggle: (groupName: string) => void;
    onEntityClick: (entity: EntityType, groupName: string) => void;
    onGroupClick?: (group: GroupType) => void;
    currentSection?: string | null;
    currentGroup?: string | null;
    loadingSection?: string | null;
    searchTerm?: string;
    highlightText?: (text: string, searchTerm: string) => React.ReactNode;
    isEntityMatch?: (entity: EntityType) => boolean;
    showGroupClickIcon?: boolean;
    isDisabled?: (entity: EntityType) => boolean;
}

export const EntityGroupAccordion = ({
    group,
    isExpanded,
    onToggle,
    onEntityClick,
    onGroupClick,
    currentSection,
    currentGroup,
    loadingSection,
    searchTerm = '',
    highlightText,
    isEntityMatch,
    showGroupClickIcon = false,
    isDisabled
}: EntityGroupAccordionProps) => {
    const theme = useTheme();
    const isCurrentGroup = currentGroup?.toLowerCase() === group.Name.toLowerCase();

    const handleGroupClick = useCallback(() => {
        onToggle(group.Name);
    }, [onToggle, group.Name]);

    const handleGroupIconClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onGroupClick) {
            onGroupClick(group);
        }
    }, [onGroupClick, group]);

    const handleEntityButtonClick = useCallback((entity: EntityType) => {
        onEntityClick(entity, group.Name);
    }, [onEntityClick, group.Name]);

    return (
        <Accordion
            disableGutters 
            expanded={isExpanded}
            onChange={handleGroupClick}
            className="group/accordion w-full first:rounded-t-lg last:rounded-b-lg shadow-none p-1"
            slotProps={{
                transition: {
                    timeout: 300,
                }
            }}
            sx={{
                backgroundColor: "background.paper",
                borderColor: 'border.main',
                '&:before': { display: 'none' },
                '& .MuiCollapse-root': {
                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMore className="w-4 h-4" sx={{ color: isCurrentGroup ? "primary.main" : "default" }} />}
                className={cn(
                    "p-2 duration-200 flex items-center rounded-md text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full min-w-0",
                    isCurrentGroup ? "font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-primary"
                )}
                sx={{
                    backgroundColor: isCurrentGroup ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    padding: '4px',
                    minHeight: '32px !important',
                    '& .MuiAccordionSummary-content': {
                        margin: 0,
                        alignItems: 'center',
                        minWidth: 0,
                        overflow: 'hidden'
                    }
                }}
            >
                <Typography
                    className={`flex-1 text-sm text-left truncate min-w-0 ${isCurrentGroup ? 'font-semibold' : ''}`}
                    sx={{
                        color: isCurrentGroup ? 'primary.main' : 'text.primary'
                    }}
                >
                    {group.Name}
                </Typography>
                <Typography
                    className={`flex-shrink-0 text-xs mr-2 ${isCurrentGroup ? 'font-semibold' : ''}`}
                    sx={{ opacity: 0.7, color: isCurrentGroup ? 'primary.main' : 'text.primary' }}
                >
                    {group.Entities.length}
                </Typography>

                {showGroupClickIcon && (
                    <OpenInNewRounded
                        onClick={handleGroupIconClick}
                        aria-label={`Link to first entity in ${group.Name}`}
                        className="w-4 h-4 flex-shrink-0"
                        sx={{
                            color: isCurrentGroup ? "primary.main" : "default"
                        }}
                    />
                )}
            </AccordionSummary>
            <AccordionDetails className="p-0">
                <Box className="flex flex-col w-full gap-1 pt-1">
                    {group.Entities.map(entity => {
                        const isCurrentSection = currentSection?.toLowerCase() === entity.SchemaName.toLowerCase();
                        const isMatch = isEntityMatch ? isEntityMatch(entity) : false;
                        const isLoading = loadingSection === entity.SchemaName;
                        const isCurrentDisabled = isDisabled && isDisabled(entity);
                        
                        // If searching and this entity doesn't match, don't render it
                        if (searchTerm.trim() && !isMatch) {
                            return null;
                        }
                        
                        return (
                            <Button
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-1 cursor-pointer transition-colors text-xs font-medium mx-1 justify-start",
                                    isMatch ? "ring-1" : "",
                                    isCurrentDisabled ? "opacity-50" : ""
                                )}
                                sx={{ 
                                    borderColor: 'accent.main',
                                    backgroundColor: isCurrentSection ? alpha(theme.palette.primary.main, 0.1) : 'transparent' 
                                }}
                                key={entity.SchemaName}
                                onClick={() => !isCurrentDisabled && handleEntityButtonClick(entity)}
                                disabled={isLoading || isCurrentDisabled}
                            >
                                {entity.IconBase64 ? (
                                    isCurrentSection ? (
                                        <div 
                                            className="h-4 w-4"
                                            style={{
                                                maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                                maskSize: 'contain',
                                                maskRepeat: 'no-repeat',
                                                maskPosition: 'center',
                                                backgroundColor: theme.palette.primary.main
                                            }}
                                        />
                                    ) : (
                                        <div 
                                            className="h-4 w-4"
                                            style={{
                                                maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                                maskSize: 'contain',
                                                maskRepeat: 'no-repeat',
                                                maskPosition: 'center',
                                                backgroundColor: theme.palette.text.primary
                                            }}
                                        />
                                    )
                                ) : (
                                    <ExtensionRounded 
                                        className="w-4 h-4" 
                                        sx={{ color: isCurrentSection ? 'primary.main' : 'text.secondary' }}
                                    />
                                )}
                                <Typography className="truncate text-xs flex-1" variant="body2" sx={{
                                    color: isCurrentSection ? 'primary' : isCurrentDisabled ? 'text.disabled' : 'text.secondary',
                                }}>
                                    {isMatch && highlightText ? highlightText(entity.DisplayName, searchTerm) : entity.DisplayName}
                                </Typography>
                                {isCurrentDisabled && (
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '10px', ml: 'auto' }}>
                                        In Diagram
                                    </Typography>
                                )}
                                {isLoading && (
                                    <CircularProgress 
                                        size={12} 
                                        sx={{ 
                                            color: 'primary.main',
                                            ml: 'auto'
                                        }}
                                    />
                                )}
                            </Button>
                        );
                    })}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};