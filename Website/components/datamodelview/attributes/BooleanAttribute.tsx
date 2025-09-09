import { useIsMobile } from "@/hooks/use-mobile";
import { BooleanAttributeType } from "@/lib/Types"
import { Box, Typography, Chip } from "@mui/material"
import { CheckRounded, RadioButtonCheckedRounded, RadioButtonUncheckedRounded } from "@mui/icons-material";

export default function BooleanAttribute({ attribute }: { attribute: BooleanAttributeType }) {

    const isMobile = useIsMobile();
    
    return (
        <Box className="flex flex-col gap-1">
            <Box className="flex items-center gap-2">
                <Typography className="font-semibold text-xs md:text-sm md:font-bold">Boolean</Typography>
                {attribute.DefaultValue !== null && !isMobile && (
                    <Chip 
                        icon={<CheckRounded className="w-2 h-2 md:w-3 md:h-3" />}
                        label={`Default: ${attribute.DefaultValue === true ? attribute.TrueLabel : attribute.FalseLabel}`}
                        size="small"
                        color="success"
                        variant="outlined"
                    />
                )}
            </Box>
            <Box className="space-y-1">
                <Box className="flex items-center justify-between py-0.5 md:py-1">
                    <Box className="flex items-center gap-1">
                        {attribute.DefaultValue === true ? (
                            <RadioButtonCheckedRounded className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'success.main' }} />
                        ) : (
                            <RadioButtonUncheckedRounded className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'text.disabled' }} />
                        )}
                        <Typography className="text-xs md:text-sm">{attribute.TrueLabel}</Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                        <Chip 
                            label="True"
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
                <Box className="flex items-center justify-between py-0.5 md:py-1">
                    <Box className="flex items-center gap-1">
                        {attribute.DefaultValue === false ? (
                            <RadioButtonCheckedRounded className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'success.main' }} />
                        ) : (
                            <RadioButtonUncheckedRounded className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'text.disabled' }} />
                        )}
                        <Typography className="text-xs md:text-sm">{attribute.FalseLabel}</Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                        <Chip 
                            label="False"
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
            </Box>
        </Box>
    )
}