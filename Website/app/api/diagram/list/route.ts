import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // For now, return mock data. In a real implementation, this would
        // query the Azure DevOps repository for .json files in the diagrams folder
        const mockDiagrams = [
            {
                path: 'diagrams/Customer_Management_2025-10-14.json',
                name: 'Customer Management',
                createdAt: '2025-10-14T10:30:00Z',
                updatedAt: '2025-10-14T15:45:00Z',
                size: 2048
            },
            {
                path: 'diagrams/Order_Processing_2025-10-13.json',
                name: 'Order Processing',
                createdAt: '2025-10-13T09:15:00Z',
                updatedAt: '2025-10-13T16:20:00Z',
                size: 1536
            },
            {
                path: 'diagrams/User_Authentication_2025-10-12.json',
                name: 'User Authentication',
                createdAt: '2025-10-12T14:00:00Z',
                updatedAt: '2025-10-12T14:30:00Z',
                size: 1024
            }
        ];

        // TODO: Replace with actual Azure DevOps API call
        // This would use the existing AzureDevOpsService to:
        // 1. List files in the diagrams/ folder
        // 2. Filter for .json files
        // 3. Extract metadata (name, dates, size)
        // 4. Return formatted list

        return NextResponse.json(mockDiagrams);

    } catch (error) {
        console.error('Error listing diagrams:', error);
        return NextResponse.json(
            { error: 'Failed to list diagrams' },
            { status: 500 }
        );
    }
}