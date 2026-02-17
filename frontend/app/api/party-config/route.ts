import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace('localhost', '127.0.0.1');

// GET party booking config
export async function GET(request: NextRequest) {
    try {
        console.log(`[Party Config API] GET party booking config`);

        const response = await fetch(`${API_URL}/cms/party-booking-config/1/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Party Config API] Error:`, errorText);
            return NextResponse.json(
                { error: `Failed to fetch party booking config`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Party Config API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
