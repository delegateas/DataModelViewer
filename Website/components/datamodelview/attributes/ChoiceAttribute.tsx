import { useIsMobile } from "@/hooks/use-mobile"
import { ChoiceAttributeType } from "@/lib/Types"
import { formatNumberSeperator } from "@/lib/utils"
import { CheckCircle, Circle, Square, CheckSquare } from "lucide-react"
import { Box, Typography, Chip, SvgIcon } from "@mui/material"

export default function ChoiceAttribute({ attribute, highlightMatch, highlightTerm }: { attribute: ChoiceAttributeType, highlightMatch: (text: string, term: string) => string | React.JSX.Element, highlightTerm: string }) {

    const isMobile = useIsMobile();

    return (
        <Box className="flex flex-col gap-1">
            <Box className="flex items-center gap-2">
                <Typography className="font-semibold text-xs md:font-bold md:text-sm">{attribute.Type}-select</Typography>
                {attribute.DefaultValue !== null && attribute.DefaultValue !== -1 && !isMobile && (
                    <Chip 
                        icon={<CheckCircle className="w-2 h-2 md:w-3 md:h-3" />}
                        label={`Default: ${attribute.Options.find(o => o.Value === attribute.DefaultValue)?.Name}`}
                        size="small"
                        sx={{ 
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            height: { xs: '20px', md: '24px' },
                            backgroundColor: 'success.light',
                            color: 'success.dark',
                            '& .MuiChip-icon': { 
                                fontSize: { xs: '0.5rem', md: '0.75rem' } 
                            }
                        }}
                    />
                )}
            </Box>
            <Box className="space-y-1">
                {attribute.Options.map(option => (
                    <Box key={option.Value}>
                        <Box className="flex items-center justify-between py-0.5 md:py-1">
                            <Box className="flex items-center gap-2">
                                <Box className="flex items-center gap-1">
                                    {attribute.Type === "Multi" ? (
                                        // For multi-select, show checkboxes
                                        option.Value === attribute.DefaultValue ? (
                                            <SvgIcon component={CheckSquare} className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'success.main' }} />
                                        ) : (
                                            <SvgIcon component={Square} className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'text.disabled' }} />
                                        )
                                    ) : (
                                        // For single-select, show radio buttons
                                        option.Value === attribute.DefaultValue ? (
                                            <SvgIcon component={CheckCircle} className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'success.main' }} />
                                        ) : (
                                            <SvgIcon component={Circle} className="w-2 h-2 md:w-3 md:h-3" sx={{ color: 'text.disabled' }} />
                                        )
                                    )}
                                    <Typography className="text-xs md:text-sm">{highlightMatch(option.Name, highlightTerm)}</Typography>
                                </Box>
                                {option.Color && (
                                    <Box 
                                        className="w-2 h-2 rounded-full shadow-sm md:w-3 md:h-3" 
                                        sx={{ 
                                            backgroundColor: option.Color,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                        title={`Color: ${option.Color}`}
                                    />
                                )}
                            </Box>
                            <Box className="flex items-center gap-2">
                                <Chip 
                                    label={formatNumberSeperator(option.Value)}
                                    size="small"
                                    sx={{ 
                                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                                        fontFamily: 'monospace',
                                        height: { xs: '20px', md: '24px' },
                                        backgroundColor: 'grey.200',
                                        color: 'grey.700'
                                    }}
                                />
                            </Box>
                        </Box>
                        {option.Description && (
                            <Typography 
                                className="text-xs italic pl-4 break-words md:pl-6"
                                sx={{ color: 'text.secondary' }}
                            >
                                {option.Description}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}