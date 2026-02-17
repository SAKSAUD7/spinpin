"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

        // Party pricing calculation
        const participantPrice = 1500;
        const extraSpectatorPrice = 100;

        // First 10 spectators are free, charge for additional
        const freeSpectators = 10;
        const chargeableSpectators = Math.max(0, spectators - freeSpectators);

        const participantCost = participants * participantPrice;
        const spectatorCost = chargeableSpectators * extraSpectatorPrice;
        const subtotal = participantCost + spectatorCost;
        const gst = subtotal * 0.18;
        let totalAmount = subtotal + gst;
        let discountAmount = 0;
        let voucherCode = null;

        // Apply voucher if provided
        if (formData.voucherCode) {
            // Validate voucher server-side
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

                    // Increment usage count
                    const vouchersRes = await fetch(`${API_URL}/shop/vouchers/?code=${voucherCode}`, {
                        cache: "no-store"
                    });
                    if (vouchersRes.ok) {
                        const voucherList = await vouchersRes.json();
                        const voucher = voucherList[0];
                        if (voucher) {
                            await fetch(`${API_URL}/shop/vouchers/${voucher.id}/`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ used_count: voucher.used_count + 1 })
                            });
                        }
                    }
                }
            }
        }

        // Convert time to 24-hour format for backend (e.g., "4:00 PM" -> "16:00:00")
        // Convert time to 24-hour format for backend (e.g., "4:00 PM" -> "16:00:00" or "14:00" -> "14:00:00")
        const convertTo24Hour = (timeStr: string) => {
            if (!timeStr) return "00:00:00";

            // If already in HH:MM or HH:MM:SS format (24-hour)
            if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
                const parts = timeStr.split(':');
                if (parts.length === 2) return `${timeStr}:00`;
                if (parts.length === 3) return timeStr;
                return timeStr;
            }

            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') {
                hours = modifier === 'PM' ? '12' : '00';
            } else if (modifier === 'PM') {
                hours = (parseInt(hours, 10) + 12).toString();
            }
            return `${hours}:${minutes}:00`;
        };

        const formattedTime = convertTo24Hour(time);

        // Create party booking via Django API using dedicated party-bookings endpoint
        const partyBookingPayload = {
            name,
            email,
            phone,
            date,
            time: formattedTime,
            duration: 120, // Party is 2 hours
            adults: 0,
            kids: participants,
            spectators,
            birthday_child_name: childName,
            birthday_child_age: childAge,
            party_package: partyPackage || null,
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
            discount_amount: 0,
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
            const error = await bookingRes.json();
            return { success: false, error: error.detail || "Failed to create party booking" };
        }

        const booking = await bookingRes.json();

        console.log("Party booking created:", booking);

        // TODO: Send confirmation email with party details and payment link
        // TODO: Generate online party invitations

        revalidatePath("/admin");
        revalidatePath("/admin/bookings");

        return {
            success: true,
            bookingId: booking.uuid || booking.id,
            booking: booking, // Include full booking object with id, uuid, etc.
            amount: totalAmount,
            depositAmount: totalAmount * 0.5 // 50% deposit
        };
    } catch (error) {
        console.error("Failed to create party booking:", error);
        return { success: false, error: "Failed to create party booking" };
    }
}

