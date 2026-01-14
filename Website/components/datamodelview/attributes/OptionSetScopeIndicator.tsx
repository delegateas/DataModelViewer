import { Box, Tooltip, Typography } from "@mui/material";
import { PublicRounded, HomeRounded } from "@mui/icons-material";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";

interface OptionSetScopeIndicatorProps {
    globalOptionSetName: string | null;
}

export default function OptionSetScopeIndicator({ globalOptionSetName }: OptionSetScopeIndicatorProps) {
    const { globalOptionSets } = useDatamodelData();

    if (!globalOptionSetName) {
        // Local option set
        return (
            <Tooltip title="Local choice" placement="top">
                <HomeRounded
                    className="w-3 h-3 md:w-4 md:h-4"
                    sx={{ color: 'text.secondary' }}
                />
            </Tooltip>
        );
    }

    // Global option set - show usages in tooltip
    const usage = globalOptionSets[globalOptionSetName];

    if (!usage) {
        // Fallback if usage data not found
        return (
            <Tooltip title={`Global choice: ${globalOptionSetName}`} placement="top">
                <PublicRounded
                    className="w-3 h-3 md:w-4 md:h-4"
                    sx={{ color: 'primary.main' }}
                />
            </Tooltip>
        );
    }

    const tooltipContent = (
        <Box>
            <Typography className="font-semibold text-xs mb-1">
                Global choice: {usage.DisplayName}
            </Typography>
            <Typography className="text-xs mb-1">
                Used by {usage.Usages.length} field{usage.Usages.length !== 1 ? 's' : ''}:
            </Typography>
            <Box className="max-h-48 overflow-y-auto">
                {usage.Usages.map((u, idx) => (
                    <Typography key={idx} className="text-xs pl-2">
                        • {u.EntityDisplayName} - {u.AttributeDisplayName}
                    </Typography>
                ))}
            </Box>
        </Box>
    );

    return (
        <Tooltip title={tooltipContent} placement="top">
            <PublicRounded
                className="w-3 h-3 md:w-4 md:h-4"
                sx={{ color: 'primary.main' }}
            />
        </Tooltip>
    );
}
