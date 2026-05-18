"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api/v1";

export async function createPartyBooking(formData: any) {
    try {
        const {
            date,
            time,
            participants,
            spectators,
            name,
            email,
            phone,
            childName,
            childAge,
            specialRequests,
            partyPackage,
            theme,
            decorations,
            catering,
            cake,
            photographer,
            partyFavors,
            dietaryRestrictions,
        } = formData;

        // SpinPin UK Party Pricing (GBP decimals — NOT pence)
        // These are fallback values; real values come from PartyBookingConfig in the DB
        const participantPrice = 15.00;   // £15.00 per guest
        const extraSpectatorPrice = 2.95; // £2.95 per extra spectator
        const freeSpectators = 2;         // First 2 spectators free (from DB config)
        const gstRate = 0;                // UK: VAT is inclusive, no separate GST

        const chargeableSpectators = Math.max(0, (spectators || 0) - freeSpectators);

        const participantCost = (participants || 0) * participantPrice;
        const spectatorCost = chargeableSpectators * extraSpectatorPrice;
        const subtotal = participantCost + spectatorCost;
        // No GST for UK — price is VAT-inclusive
        const gst = subtotal * (gstRate / 100);
        let totalAmount = subtotal + gst;
        let discountAmount = 0;
        let voucherCode = null;

        // Apply voucher if provided
        if (formData.voucherCode) {
            try {
                const voucherRes = await fetch(`${API_URL}/shop/vouchers/validate/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code: formData.voucherCode.toUpperCase(),
                        order_amount: subtotal
                    }),
                    cache: "no-store"
                });

                if (voucherRes.ok) {
                    const voucherData = await voucherRes.json();
                    if (voucherData.valid) {
                        discountAmount = voucherData.discount_amount;
                        totalAmount = voucherData.final_amount;
                        voucherCode = formData.voucherCode.toUpperCase();
                    }
                }
            } catch {
                // Voucher validation failed silently — continue without discount
            }
        }

        // Convert time to 24-hour HH:MM:SS format for backend
        const convertTo24Hour = (timeStr: string) => {
            if (!timeStr) return "12:00:00";

            // Already HH:MM or HH:MM:SS (24-hour)
            if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
                const parts = timeStr.split(':');
                if (parts.length === 2) return `${timeStr}:00`;
                if (parts.length === 3) return timeStr;
                return `${timeStr}:00`;
            }

            const [timePart, modifier] = timeStr.split(' ');
            let [hours, minutes] = timePart.split(':');
            if (hours === '12') {
                hours = modifier === 'PM' ? '12' : '00';
            } else if (modifier === 'PM') {
                hours = (parseInt(hours, 10) + 12).toString().padStart(2, '0');
            }
            return `${hours}:${minutes}:00`;
        };

        const formattedTime = convertTo24Hour(time);

        const partyBookingPayload = {
            name,
            email,
            phone,
            date,
            time: formattedTime,
            duration: 120, // 2-hour party
            adults: spectators || 0,
            kids: participants || 0,
            spectators: spectators || 0,
            birthday_child_name: childName || null,
            birthday_child_age: childAge || null,
            party_package: partyPackage || "STANDARD",
            theme: theme || null,
            decorations: decorations || false,
            catering: catering || false,
            cake: cake || false,
            photographer: photographer || false,
            party_favors: partyFavors || false,
            special_requests: specialRequests || null,
            dietary_restrictions: dietaryRestrictions || null,
            subtotal,
            amount: totalAmount,
            discount_amount: discountAmount,
            booking_status: "PENDING",
            payment_status: "PENDING",
            waiver_status: "PENDING",
        };

        const bookingRes = await fetch(`${API_URL}/bookings/party-bookings/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partyBookingPayload)
        });

        if (!bookingRes.ok) {
            const error = await bookingRes.json().catch(() => ({}));
            return { success: false, error: error.detail || "Failed to create party booking" };
        }

        const booking = await bookingRes.json();

        revalidatePath("/admin");
        revalidatePath("/admin/bookings");
        revalidatePath("/admin/party-bookings");

        return {
            success: true,
            bookingId: booking.uuid || String(booking.id),
            booking,
            amount: totalAmount,
            depositAmount: totalAmount * 0.2 // 20% deposit (from DB config)
        };
    } catch (error) {
        console.error("Failed to create party booking:", error);
        return { success: false, error: "Failed to create party booking. Please try again." };
    }
}
