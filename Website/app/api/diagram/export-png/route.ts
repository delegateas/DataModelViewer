import { NextRequest, NextResponse } from 'next/server';
import { commitFileToRepo } from '../../services/AzureDevOpsService';

interface PngExportRequest {
    fileName: string;
    imageData: string; // Base64 encoded PNG data
}

export async function POST(request: NextRequest) {
    try {
        const { fileName, imageData }: PngExportRequest = await request.json();

        // Validate required fields
        if (!fileName || !imageData) {
            return NextResponse.json(
                { error: 'File name and image data are required' },
                { status: 400 }
            );
        }

        // Ensure file name has .png extension
        const normalizedFileName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;

        // Generate file path
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedName = normalizedFileName.replace(/\.png$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        const fileNameWithTimestamp = `${sanitizedName}_${timestamp}.png`;
        const filePath = `diagrams/exports/${fileNameWithTimestamp}`;

        // imageData is already base64 encoded PNG from the client
        // We need to pass it as binary data that commitFileToRepo will encode
        // Decode base64 to buffer, then encode as latin1 string for transport
        const binaryBuffer = Buffer.from(imageData, 'base64');

        // IMPORTANT: Pass as latin1 to preserve exact binary data through string conversion
        // commitFileToRepo will do Buffer.from(content) which defaults to utf8
        // We need to prevent utf8 interpretation of binary data
        // Solution: Pass the raw buffer data using latin1 encoding
        const binaryContent = binaryBuffer.toString('latin1');

        // Save to Azure DevOps repository
        const commitMessage = `Export diagram as PNG: ${normalizedFileName}`;

        // Pass isBinary flag so commitFileToRepo uses latin1 encoding
        const result = await commitFileToRepo({
            filePath,
            content: binaryContent,
            commitMessage,
            branch: 'main',
            repositoryName: process.env.ADO_REPOSITORY_NAME || '',
            isUpdate: false,
            isBinary: true // Important: tells service to use latin1 encoding for binary data
        });

        return NextResponse.json({
            success: true,
            message: 'PNG exported to cloud successfully',
            filePath,
            commitId: result.commitId,
            fileName: fileNameWithTimestamp
        });

    } catch (error) {
        console.error('Error exporting PNG to cloud:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Failed to export PNG: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to export PNG: Unknown error' },
            { status: 500 }
        );
    }
}
