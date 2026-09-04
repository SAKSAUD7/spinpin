const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1';

export async function fetchCharityConfig(token?: string) {
    try {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`${API_URL}/cms/charity-config/`, { 
            headers,
            cache: 'no-store' 
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // The endpoint returns a list; grab the singleton (id=1)
        return Array.isArray(data) ? (data[0] ?? null) : data;
    } catch (error) {
        console.error("Error fetching charity config:", error);
        return null;
    }
}

export async function updateCharityConfig(id: number, data: any, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/cms/charity-config/${id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        cache: 'no-store',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

