const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1';

export async function fetchCharityConfig() {
    try {
        const res = await fetch(`${API_URL}/cms/charity-config/`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // The endpoint returns a list; grab the singleton (id=1)
        return Array.isArray(data) ? (data[0] ?? null) : data;
    } catch (error) {
        console.error("Error fetching charity config:", error);
        return null;
    }
}

export async function updateCharityConfig(id: number, data: any) {
    const res = await fetch(`${API_URL}/cms/charity-config/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        cache: 'no-store',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

