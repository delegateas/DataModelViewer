import { NextRequest, NextResponse } from 'next/server';
import { pullFileVersion, type LoadFileVersionOptions } from '../../services/AzureDevOpsService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('filePath');
        const commitId = searchParams.get('commitId');
        const repositoryName = searchParams.get('repositoryName') || undefined;
        
        if (!filePath) {
            return NextResponse.json(
                { error: 'filePath parameter is required' },
                { status: 400 }
            );
        }

        if (!commitId) {
            return NextResponse.json(
                { error: 'commitId parameter is required' },
                { status: 400 }
            );
        }

        const options: LoadFileVersionOptions = {
            filePath,
            commitId,
            repositoryName
        };

        const fileContent = await pullFileVersion(options);
        
        return NextResponse.json({
            success: true,
            filePath,
            commitId,
            content: fileContent
        });

    } catch (error) {
        console.error('Error loading file version:', error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { 
                    error: 'Failed to load file version',
                    details: error.message 
                },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}