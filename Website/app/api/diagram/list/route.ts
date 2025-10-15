import { NextResponse } from 'next/server';
import { listFilesFromRepo, type GitItem } from '../../auth/azuredevops/AzureDevOpsService';

interface DiagramMetadata {
    path: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    size: number;
}

export async function GET() {
    try {
        // List files in the diagrams folder from Azure DevOps
        const files = await listFilesFromRepo({
            filePath: 'diagrams',
            branch: 'main'
        });

        // Filter for .json files and extract metadata
        const diagrams: DiagramMetadata[] = files
            .filter((file: GitItem) => file.path.endsWith('.json'))
            .map((file: GitItem) => {
                // Extract diagram name from filename (remove path and extension)
                const fileName = file.path.split('/').pop() || '';
                const nameWithoutExtension = fileName.replace('.json', '');
                
                // Try to extract a clean name (remove timestamp if present)
                const cleanName = nameWithoutExtension.replace(/_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.*$/, '').replace(/_/g, ' ');

                return {
                    path: file.path,
                    name: cleanName || nameWithoutExtension,
                    createdAt: new Date().toISOString(), // TODO: Get actual creation date from git history
                    updatedAt: new Date().toISOString(), // TODO: Get actual modification date from git history
                    size: file.contentMetadata?.size || 0
                };
            })
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // Sort by most recent first

        return NextResponse.json(diagrams);

    } catch (error) {
        console.error('Error listing diagrams:', error);
        
        // If it's a folder not found error, return empty array (diagrams folder doesn't exist yet)
        if (error instanceof Error && error.message.includes('Folder not found')) {
            return NextResponse.json([]);
        }
        
        return NextResponse.json(
            { error: `Failed to list diagrams: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}