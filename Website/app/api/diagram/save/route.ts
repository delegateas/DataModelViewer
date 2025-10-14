import { NextRequest, NextResponse } from 'next/server';
import { createFileInRepo } from '../../auth/azuredevops/AzureDevOpsService';

export interface DiagramSaveData {
    id: string;
    name: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    metadata: {
        zoom: number;
        translate: { x: number; y: number };
        canvasSize?: { width: number; height: number };
    };
    entities: Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        size: { width: number; height: number };
        label: string;
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const diagramData: DiagramSaveData = await request.json();

        // Validate required fields
        if (!diagramData.id || !diagramData.name) {
            return NextResponse.json(
                { error: 'Diagram ID and name are required' },
                { status: 400 }
            );
        }

        // Generate file path based on diagram name and timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${diagramData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
        const filePath = `diagrams/${fileName}`;

        // Add metadata
        const enrichedData: DiagramSaveData = {
            ...diagramData,
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            createdAt: diagramData.createdAt || new Date().toISOString()
        };

        // Save to Azure DevOps repository
        const result = await createFileInRepo({
            filePath,
            content: JSON.stringify(enrichedData, null, 2),
            commitMessage: `Save diagram: ${diagramData.name}`,
            branch: 'main'
        });

        return NextResponse.json({
            success: true,
            message: 'Diagram saved successfully',
            filePath,
            commitId: result.commitId,
            fileName
        });

    } catch (error) {
        console.error('Error saving diagram:', error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Failed to save diagram: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to save diagram: Unknown error' },
            { status: 500 }
        );
    }
}