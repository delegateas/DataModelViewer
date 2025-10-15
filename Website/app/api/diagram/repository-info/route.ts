import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Extract organization name from the URL
        const organizationUrl = process.env.ADO_ORGANIZATION_URL || '';
        const repositoryName = process.env.ADO_REPOSITORY_NAME || '';
        
        // Parse organization name from URL (e.g., "https://dev.azure.com/MedlemX/" -> "MedlemX")
        let organizationName = '';
        if (organizationUrl) {
            const urlMatch = organizationUrl.match(/https:\/\/dev\.azure\.com\/([^\/]+)\/?/);
            if (urlMatch && urlMatch[1]) {
                organizationName = urlMatch[1];
            }
        }

        return NextResponse.json({
            organization: organizationName,
            repository: repositoryName,
            project: process.env.ADO_PROJECT_NAME || ''
        });

    } catch (error) {
        console.error('Error getting repository info:', error);
        return NextResponse.json(
            { error: 'Failed to get repository information' },
            { status: 500 }
        );
    }
}