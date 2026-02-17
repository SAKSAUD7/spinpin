/**
 * Utility functions for handling media URLs from the backend
 */

export const getMediaUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // Azure Storage Base URL
    const AZURE_MEDIA_URL = 'https://ninjapark.blob.core.windows.net/media';

    // If it's already an absolute URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Handle relative uploads/media paths to point to Azure
    if (path.startsWith('uploads/') || path.startsWith('media/') || path.startsWith('logos/')) {
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${AZURE_MEDIA_URL}/${cleanPath}`;
    }

    // Get API base URL for other internal paths
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';
    const API_ROOT = API_BASE_URL.replace('/api/v1', '');

    if (path.startsWith('/')) {
        return `${API_ROOT}${path}`;
    }

    return `${API_ROOT}/${path}`;
};
