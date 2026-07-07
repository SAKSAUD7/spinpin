import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:9000/api/v1').replace('localhost', '127.0.0.1');

/**
 * POST /api/payments/verify
 * Proxies payment verification to Django backend server-side.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const res = await fetch(`${BACKEND}/payments/verify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data.error || 'Payment verification failed' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[Payment Verify Proxy] Error:', err);
        return NextResponse.json(
            { error: 'Failed to connect to payment service' },
            { status: 500 }
        );
    }
}
