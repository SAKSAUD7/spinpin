import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace('localhost', '127.0.0.1');

export async function GET(request: NextRequest) {
    try {
        // Get the token from httpOnly cookie (server-side)
        const token = cookies().get("admin_token")?.value;

        if (!token) {
            console.error('[API Route] No authentication token found');
            return NextResponse.json(
                { error: "Not authenticated", detail: "Please log in to access this resource" },
                { status: 401 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type')?.toUpperCase() || 'SESSION';

        console.log(`[API Route] Fetching ${type} bookings`);

        // Build API URL based on type
        let apiUrl: string;
        if (type === 'PARTY') {
            apiUrl = `${API_URL}/bookings/party-bookings/?ordering=-created_at`;
        } else if (type === 'SESSION') {
            apiUrl = `${API_URL}/bookings/bookings/?type=SESSION&ordering=-created_at`;
        } else {
            // For "ALL" type, we'll fetch both and combine
            return NextResponse.json(
                { error: "Use /api/bookings/all for combined bookings" },
                { status: 400 }
            );
        }

        console.log(`[API Route] Calling: ${apiUrl}`);

        // Fetch from backend with token
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Route] Backend error ${response.status}:`, errorText);
            return NextResponse.json(
                {
                    error: `Backend API returned ${response.status}`,
                    details: errorText,
                    type: type
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log(`[API Route] Successfully fetched ${data.length || 0} ${type} bookings`);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[API Route] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
