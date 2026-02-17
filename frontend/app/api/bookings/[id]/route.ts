import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    const token = cookies().get("admin_token")?.value;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type')?.toUpperCase() || 'SESSION';

    try {
        // Build URL based on booking type
        let apiUrl: string;
        if (type === 'PARTY') {
            apiUrl = `${BACKEND_URL}/bookings/party-bookings/${id}/`;
        } else {
            apiUrl = `${BACKEND_URL}/bookings/bookings/${id}/`;
        }

        const res = await fetch(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to fetch booking" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    const token = cookies().get("admin_token")?.value;
    const body = await request.json();
    const type = body.type?.toUpperCase() || 'SESSION';

    try {
        // Build URL based on booking type
        let apiUrl: string;
        if (type === 'PARTY') {
            apiUrl = `${BACKEND_URL}/bookings/party-bookings/${id}/`;
        } else {
            apiUrl = `${BACKEND_URL}/bookings/bookings/${id}/`;
        }

        const res = await fetch(apiUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to update booking" },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
