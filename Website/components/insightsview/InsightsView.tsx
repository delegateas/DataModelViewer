'use client'

import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useSidebar } from '@/contexts/SidebarContext'
import { useSearchParams } from 'next/navigation'
import SidebarInsightsView from './SidebarInsightsView'
import InsightsSolutionView from './solutions/InsightsSolutionView'
import InsightsOverviewView from './overview/InsightsOverviewView'

interface InsightsViewProps {

}

const InsightsView = ({ }: InsightsViewProps) => {
    const { setElement, expand } = useSidebar();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'overview';

    useEffect(() => {
        setElement(<SidebarInsightsView />);
        expand();
    }, [setElement, expand]);

    const renderContent = () => {
        switch (currentView) {
            case 'overview':
                return (
                    <InsightsOverviewView />
                );
            case 'solutions':
                return (
                    <InsightsSolutionView />
                );
            case 'compliance':
                return (
                    <Box>
                        <Typography variant="h4" className="mb-6 font-semibold">
                            Compliance
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Review compliance and governance insights for your data model.
                        </Typography>
                    </Box>
                );
            default:
                return (
                    <Box>
                        <Typography variant="h4" className="mb-6 font-semibold">
                            Insights
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Select a category from the sidebar to view insights.
                        </Typography>
                    </Box>
                );
        }
    };

    return (
        <Box className="my-6">
            {renderContent()}
        </Box>
    )
}

export default InsightsView