import { StatusAttributeType, StatusOption } from "@/lib/Types";
import { formatNumberSeperator } from "@/lib/utils";
import { CircleRounded } from "@mui/icons-material";
import { Box, Typography, Chip } from "@mui/material";

export default function StatusAttribute({ attribute }: { attribute: StatusAttributeType }) {
    const groupedOptions = attribute.Options.reduce((acc, option) => {
        if (!acc[option.State]) {
            acc[option.State] = [];
        }
        acc[option.State].push(option);
        return acc;
    }, {} as Record<string, StatusOption[]>);

    return (
        <Box className="flex flex-col gap-1">
            <Box className="flex items-center gap-2">
                <Typography className="font-semibold text-xs md:font-bold md:text-sm">State/Status</Typography>
                {/* No DefaultValue for StatusAttributeType, so no default badge */}
            </Box>
            {Object.entries(groupedOptions).map(([state, options]) => (
                <Box key={state} className="flex flex-col gap-1">
                    <Typography className="font-medium text-xs md:text-sm">{state}</Typography>
                    <Box className="space-y-1">
                        {options.map(option => (
                            <Box key={option.Value}>
                                <Box className="flex items-center justify-between py-0.5 md:py-1">
                                    <Box className="flex items-center gap-2">
                                        <Box className="flex items-center gap-1">
                                            {/* No DefaultValue, so always show Circle icon */}
                                            <CircleRounded className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'text.disabled' }} />
                                            <Typography className="text-xs md:text-sm">{option.Name}</Typography>
                                        </Box>
                                    </Box>
                                    <Box className="flex items-center gap-2">
                                        <Chip 
                                            label={formatNumberSeperator(option.Value)}
                                            size="small"
                                            sx={{ 
                                                fontSize: { xs: '0.625rem', md: '0.875rem' },
                                                fontFamily: 'monospace',
                                                height: { xs: '16px', md: '24px' },
                                                backgroundColor: 'grey.200',
                                                color: 'grey.700'
                                            }}
                                        />
                                    </Box>
                                </Box>
                                {/* No Description property */}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}