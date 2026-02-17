'use server';

/**
 * Universal CMS Utilities
 * 
 * These functions provide a consistent interface for saving and deleting
 * CMS items across all models. Works with any model that has image fields.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface CMSSaveResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Save a CMS item (create or update)
 * 
 * @param model - Model name (e.g., 'activities', 'testimonials', 'gallery')
 * @param data - Form data including image_url and other fields
 * @param id - Optional ID for updates
 * @returns Promise with save result
 */
export async function saveCMSItem(
    model: string,
    data: Record<string, any>,
    id?: number
): Promise<CMSSaveResult> {
    try {
        const url = id
            ? `${API_URL}/cms/${model}/${id}/`
            : `${API_URL}/cms/${model}/`;

        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            cache: 'no-store',
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Save failed' }));
            return {
                success: false,
                error: error.detail || `Failed with status ${res.status}`,
            };
        }

        const result = await res.json();
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

/**
 * Delete a CMS item
 * 
 * @param model - Model name
 * @param id - Item ID to delete
 * @returns Promise with delete result
 */
export async function deleteCMSItem(
    model: string,
    id: number
): Promise<CMSSaveResult> {
    try {
        const res = await fetch(`${API_URL}/cms/${model}/${id}/`, {
            method: 'DELETE',
            cache: 'no-store',
        });

        if (!res.ok) {
            return {
                success: false,
                error: 'Delete failed',
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

/**
 * Fetch a single CMS item
 * 
 * @param model - Model name
 * @param id - Item ID
 * @returns Promise with item data
 */
export async function getCMSItem(
    model: string,
    id: number
): Promise<any> {
    const res = await fetch(`${API_URL}/cms/${model}/${id}/`, {
        cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch item');
    return res.json();
}

/**
 * Fetch all items for a model
 * 
 * @param model - Model name
 * @returns Promise with array of items
 */
export async function getCMSItems(model: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/cms/${model}/`, {
        cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
}
