import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * GET /api/bookings/slot-availability?date=YYYY-MM-DD
 * Proxies to Django: GET /api/bookings/bookings/slot_availability/?date=...
 * Returns per-slot occupancy so the frontend can show 🟢/🟡/🔴 status.
 */
export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date");
    if (!date) {
        return NextResponse.json({ error: "date required" }, { status: 400 });
    }

    try {
        const res = await fetch(
            `${API_URL}/bookings/bookings/slot_availability/?date=${date}`,
            { cache: "no-store" }
        );
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch slot availability" }, { status: 500 });
    }
}
