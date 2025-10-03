import { Paper, Typography } from '@mui/material'
import React from 'react'

interface InsightsSolutionViewProps {

}

const InsightsSolutionView = ({ }: InsightsSolutionViewProps) => {
    return (
        <Paper className="p-6 rounded-2xl" elevation={2}>
            <Typography variant="h4" className="mb-6 font-semibold">
                Solutions
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Discover solutions and recommendations for your data model.
            </Typography>
        </Paper>
    )
}

export default InsightsSolutionView;
