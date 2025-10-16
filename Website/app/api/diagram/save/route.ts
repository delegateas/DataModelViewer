import { NextRequest, NextResponse } from 'next/server';
import { commitFileToRepo } from '../../services/AzureDevOpsService';
import { SerializedDiagram } from '@/lib/diagram/models/serialized-diagram';

interface DiagramSaveData extends SerializedDiagram {
    overwriteFilePath?: string;
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

        // Generate file path - use overwrite path if provided, otherwise create new
        let fileName: string;
        let filePath: string;
        
        if (diagramData.overwriteFilePath) {
            // Overwriting existing file
            filePath = diagramData.overwriteFilePath;
            fileName = filePath.split('/').pop() || 'diagram.json';
        } else {
            // Creating new file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            fileName = `${diagramData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
            filePath = `diagrams/${fileName}`;
        }

        let newVersion = '1.0.0'; // Default for new diagrams
        if (diagramData.overwriteFilePath) {
            const currentVersion = diagramData.version || '1.0.0';
            const versionParts = currentVersion.split('.').map(Number);
            
            // Increment patch version (x.y.z -> x.y.z+1)
            versionParts[2] = (versionParts[2] || 0) + 1;
            newVersion = versionParts.join('.');
        }

        // Add metadata
        const enrichedData: DiagramSaveData = {
            ...diagramData,
            version: newVersion,
            updatedAt: new Date().toISOString(),
            createdAt: diagramData.createdAt || new Date().toISOString()
        };

        // Save to Azure DevOps repository
        const commitMessage = diagramData.overwriteFilePath 
            ? `Update diagram: ${diagramData.name}`
            : `Save diagram: ${diagramData.name}`;
            
        const result = await commitFileToRepo({
            filePath,
            content: JSON.stringify(enrichedData, null, 2),
            commitMessage,
            branch: 'main',
            repositoryName: process.env.ADO_REPOSITORY_NAME || '',
            isUpdate: Boolean(diagramData.overwriteFilePath)
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