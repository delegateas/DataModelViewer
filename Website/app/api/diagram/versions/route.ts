import { NextRequest, NextResponse } from 'next/server';
import { listFileVersions, type FileVersionOptions } from '../../services/AzureDevOpsService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('filePath');
        const repositoryName = process.env.ADO_REPOSITORY_NAME || '';
        const maxVersionsParam = searchParams.get('maxVersions');
        
        if (!filePath) {
            return NextResponse.json(
                { error: 'filePath parameter is required' },
                { status: 400 }
            );
        }

        const maxVersions = maxVersionsParam ? parseInt(maxVersionsParam, 10) : undefined;
        
        if (maxVersionsParam && (isNaN(maxVersions!) || maxVersions! <= 0)) {
            return NextResponse.json(
                { error: 'maxVersions must be a positive number' },
                { status: 400 }
            );
        }

        const options: FileVersionOptions = {
            filePath,
            repositoryName,
            maxVersions
        };

        const versions = await listFileVersions(options);
        
        return NextResponse.json({
            success: true,
            filePath,
            versions
        });

    } catch (error) {
        console.error('Error listing file versions:', error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { 
                    error: 'Failed to list file versions',
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