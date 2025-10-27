import { useState, useEffect } from 'react';

interface RepositoryInfo {
    organization: string;
    repository: string;
    project: string;
}

interface UseRepositoryInfoResult {
    repositoryInfo: RepositoryInfo | null;
    isCloudConfigured: boolean;
    isLoading: boolean;
    error: string | null;
}

export const useRepositoryInfo = (): UseRepositoryInfoResult => {
    const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepositoryInfo = async () => {
            try {
                const response = await fetch('/api/diagram/repository-info');
                if (!response.ok) {
                    throw new Error('Failed to fetch repository info');
                }
                
                const data = await response.json();
                setRepositoryInfo(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setRepositoryInfo(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRepositoryInfo();
    }, []);

    const isCloudConfigured = Boolean(
        repositoryInfo?.organization && 
        repositoryInfo?.repository && 
        repositoryInfo?.project
    );

    return {
        repositoryInfo,
        isCloudConfigured,
        isLoading,
        error
    };
};