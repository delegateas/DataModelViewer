import { managedAuth } from './ManagedIdentityAuthService';

interface CreateFileOptions {
    filePath: string;
    content: string; // Will be JSON.stringify'd
    commitMessage?: string;
    branch?: string;
    repositoryName?: string; // Optional override
}

interface LoadFileOptions {
    filePath: string;
    branch?: string;
    repositoryName?: string; // Optional override
}

interface GitFileResponse {
    objectId: string;
    gitObjectType: string;
    commitId: string;
    path: string;
    content?: string;
}

interface GitCommitResponse {
    commitId: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    committer: {
        name: string;
        email: string;
        date: string;
    };
    comment: string;
}

class AzureDevOpsError extends Error {
    constructor(message: string, public statusCode?: number, public response?: unknown) {
        super(message);
        this.name = 'AzureDevOpsError';
    }
}

async function getRepositoryId(repositoryName?: string): Promise<string> {
    const config = managedAuth.getConfig();
    const repoName = repositoryName || process.env.AdoRepositoryName || config.repositoryName;
    
    if (!repoName) {
        throw new AzureDevOpsError('Repository name not found. Set AdoRepositoryName environment variable or pass repositoryName parameter.');
    }

    try {
        const repoUrl = `${config.organizationUrl}${config.projectName}/_apis/git/repositories/${encodeURIComponent(repoName)}?api-version=7.0`;
        const response = await managedAuth.makeAuthenticatedRequest(repoUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new AzureDevOpsError(`Failed to get repository info for '${repoName}': ${response.status} - ${errorText}`, response.status);
        }

        const repoData = await response.json();
        return repoData.id;

    } catch (error) {
        if (error instanceof AzureDevOpsError) {
            throw error;
        }
        throw new AzureDevOpsError(`Unexpected error getting repository ID for '${repoName}': ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Creates a JSON file in the Azure DevOps Git repository
 * @param options Configuration for file creation
 * @returns Promise with commit information
 */
export async function createFileInRepo(options: CreateFileOptions): Promise<GitCommitResponse> {
    const {
        filePath,
        content,
        commitMessage = `Add ${filePath}`,
        branch = 'main',
        repositoryName
    } = options;

    try {
        // Get ADO configuration
        const config = managedAuth.getConfig();
        
        // Validate inputs
        if (!filePath || content === undefined) {
            throw new AzureDevOpsError('File path and content are required');
        }

        // Get repository ID from environment variable or parameter
        const repositoryId = await getRepositoryId(repositoryName);

        // Convert content to JSON string and then to base64
        const jsonContent = JSON.stringify(content, null, 2);
        const base64Content = Buffer.from(jsonContent).toString('base64');

        // Get the latest commit ID for the branch (needed for push operation)
        const refsUrl = `${config.organizationUrl}${config.projectName}/_apis/git/repositories/${repositoryId}/refs?filter=heads/${branch}&api-version=7.0`;
        const refsResponse = await managedAuth.makeAuthenticatedRequest(refsUrl);
        
        if (!refsResponse.ok) {
            const errorText = await refsResponse.text();
            throw new AzureDevOpsError(`Failed to get branch refs: ${refsResponse.status} - ${errorText}`, refsResponse.status);
        }

        const refsData = await refsResponse.json();
        const currentCommitId = refsData.value?.[0]?.objectId;

        if (!currentCommitId) {
            throw new AzureDevOpsError(`Branch '${branch}' not found or has no commits`);
        }

        // Create the push payload
        const pushPayload = {
            refUpdates: [
                {
                    name: `refs/heads/${branch}`,
                    oldObjectId: currentCommitId
                }
            ],
            commits: [
                {
                    comment: commitMessage,
                    author: {
                        name: "DataModelViewer",
                        email: "system@datamodelviewer.com"
                    },
                    changes: [
                        {
                            changeType: "add",
                            item: {
                                path: filePath.startsWith('/') ? filePath : `/${filePath}`
                            },
                            newContent: {
                                content: base64Content,
                                contentType: "base64encoded"
                            }
                        }
                    ]
                }
            ]
        };

        // Push the changes
        const pushUrl = `${config.organizationUrl}${config.projectName}/_apis/git/repositories/${repositoryId}/pushes?api-version=7.0`;
        const pushResponse = await managedAuth.makeAuthenticatedRequest(pushUrl, {
            method: 'POST',
            body: JSON.stringify(pushPayload)
        });

        if (!pushResponse.ok) {
            const errorText = await pushResponse.text();
            throw new AzureDevOpsError(`Failed to create file: ${pushResponse.status} - ${errorText}`, pushResponse.status);
        }

        const pushData = await pushResponse.json();
        
        return {
            commitId: pushData.commits[0].commitId,
            author: pushData.commits[0].author,
            committer: pushData.commits[0].committer,
            comment: pushData.commits[0].comment
        };

    } catch (error) {
        if (error instanceof AzureDevOpsError) {
            throw error;
        }
        throw new AzureDevOpsError(`Unexpected error creating file: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Loads a JSON file from the Azure DevOps Git repository
 * @param options Configuration for file loading
 * @returns Promise with parsed JSON content
 */
export async function loadFileFromRepo<T>(options: LoadFileOptions): Promise<T> {
    const {
        filePath,
        branch = 'main',
        repositoryName
    } = options;

    try {
        // Get ADO configuration
        const config = managedAuth.getConfig();
        
        // Validate inputs
        if (!filePath) {
            throw new AzureDevOpsError('File path is required');
        }

        // Get repository ID from environment variable or parameter
        const repositoryId = await getRepositoryId(repositoryName);

        // Construct the API URL for getting file content
        const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const fileUrl = `${config.organizationUrl}${config.projectName}/_apis/git/repositories/${repositoryId}/items?path=/${normalizedPath}&version=${branch}&includeContent=true&api-version=7.0`;

        const response = await managedAuth.makeAuthenticatedRequest(fileUrl);

        if (!response.ok) {
            if (response.status === 404) {
                throw new AzureDevOpsError(`File not found: ${filePath}`, 404);
            }
            const errorText = await response.text();
            throw new AzureDevOpsError(`Failed to load file: ${response.status} - ${errorText}`, response.status);
        }

        const fileData: GitFileResponse = await response.json();

        if (!fileData.content) {
            throw new AzureDevOpsError(`File content is empty: ${filePath}`);
        }

        // Decode base64 content and parse JSON
        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        
        try {
            return JSON.parse(decodedContent) as T;
        } catch (parseError) {
            throw new AzureDevOpsError(`Failed to parse JSON content: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

    } catch (error) {
        if (error instanceof AzureDevOpsError) {
            throw error;
        }
        throw new AzureDevOpsError(`Unexpected error loading file: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Helper function to get repository information using environment variable
export async function getRepositoryInfo(repositoryName?: string): Promise<{ id: string; name: string; webUrl: string }> {
    try {
        const config = managedAuth.getConfig();
        const repoName = repositoryName || process.env.AdoRepositoryName || config.repositoryName;
        
        if (!repoName) {
            throw new AzureDevOpsError('Repository name not found. Set AdoRepositoryName environment variable or pass repositoryName parameter.');
        }

        const repoUrl = `${config.organizationUrl}${config.projectName}/_apis/git/repositories/${encodeURIComponent(repoName)}?api-version=7.0`;
        const response = await managedAuth.makeAuthenticatedRequest(repoUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new AzureDevOpsError(`Failed to get repository info: ${response.status} - ${errorText}`, response.status);
        }

        const repoData = await response.json();
        
        return {
            id: repoData.id,
            name: repoData.name,
            webUrl: repoData.webUrl
        };

    } catch (error) {
        if (error instanceof AzureDevOpsError) {
            throw error;
        }
        throw new AzureDevOpsError(`Unexpected error getting repository info: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Export types for external use
export type { CreateFileOptions, LoadFileOptions, GitCommitResponse, GitFileResponse };
export { AzureDevOpsError };