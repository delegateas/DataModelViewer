'use client'

import { EntityType } from "@/lib/Types";
import { Link } from "lucide-react";
import { EntityDetails } from "./EntityDetails";
import { Box, Typography, Paper, useTheme } from '@mui/material';

export function EntityHeader({ entity }: { entity: EntityType }) {
    const theme = useTheme();
    
    return (
        <Box 
            sx={{ 
                minWidth: 0, 
                width: { xl: '33.333333%', xs: '100%' }, 
                pr: { xl: 3, xs: 0 } 
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ flexShrink: 0 }}>
                    {entity.IconBase64 == null ? 
                        <Link 
                            style={{ 
                                height: '24px', 
                                width: '24px', 
                                color: theme.palette.text.secondary 
                            }} 
                        /> : 
                        <div 
                            className="h-6 w-6"
                            style={{
                                mask: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                backgroundColor: theme.palette.text.primary
                            }}
                        />
                    }
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                        component="a"
                        href={`#${entity.SchemaName}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'none',
                                '& .entity-title': {
                                    color: 'primary.main',
                                }
                            }
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            component="h2"
                            className="entity-title"
                            sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                transition: 'color 0.2s',
                                minWidth: 0
                            }}
                        >
                            {entity.DisplayName}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary',
                                fontFamily: 'monospace',
                                flexShrink: 0
                            }}
                        >
                            {entity.SchemaName}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
                <EntityDetails entity={entity} />
            </Box>

            {entity.Description && (
                <Paper 
                    variant="outlined"
                    sx={{ 
                        p: 2,
                        backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.02)' 
                            : 'rgba(0, 0, 0, 0.02)',
                        borderColor: 'border.main'
                    }}
                >
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.6
                        }}
                    >
                        {entity.Description}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}