import { NextRequest, NextResponse } from 'next/server';
import { pullFileFromRepo } from '../../services/AzureDevOpsService';

export async function POST(request: NextRequest) {
    try {
        const { filePath } = await request.json();

        if (!filePath) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }

        // Load diagram from Azure DevOps repository
        const diagramData = await pullFileFromRepo({
            filePath,
            branch: 'main',
            repositoryName: process.env.ADO_REPOSITORY_NAME || ''
        });

        return NextResponse.json(diagramData);

    } catch (error) {
        console.error('Error loading diagram:', error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Failed to load diagram: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to load diagram: Unknown error' },
            { status: 500 }
        );
    }
}