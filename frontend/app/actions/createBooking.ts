"use server";

import { revalidatePath } from "next/cache";
import { bookingSchema, formatPhoneNumber } from "@repo/types";
import QRCode from "qrcode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Generate unique booking number: NIP-YYYYMMDD-XXXX
function generateBookingNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `NIP-${year}${month}${day}-${random}`;
}

// Sanitize string input to prevent XSS
function sanitizeString(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .replace(/[^\w\s.@'-]/g, '') // Allow only alphanumeric, spaces, dots, @, hyphens, apostrophes
        .trim();
}

// Validate email format server-side
function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Validate phone format server-side
function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

export async function createBooking(formData: any) {
    try {
        // Server-side validation using Zod schema
        const validationResult = bookingSchema.safeParse(formData);

        if (!validationResult.success) {
            console.error("Validation failed:", validationResult.error.issues);
            const firstError = validationResult.error.issues[0];
            return {
                success: false,
                error: firstError.message || "Invalid form data. Please check your inputs."
            };
        }

        const data = validationResult.data;

        // Additional server-side checks
        if (!isValidEmail(data.email)) {
            return { success: false, error: "Invalid email format" };
        }

        // Sanitize inputs
        const sanitizedName = sanitizeString(data.name);
        const sanitizedEmail = data.email.toLowerCase().trim();
        const sanitizedPhone = data.phone.trim();

        // Validate date is not in the past
        const selectedDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return { success: false, error: "Cannot book for past dates" };
        }

        // Validate time is not in the past for today's bookings
        if (selectedDate.toDateString() === today.toDateString()) {
            const [hours, minutes] = data.time.split(':').map(Number);
            const bookingTime = new Date();
            bookingTime.setHours(hours, minutes || 0, 0, 0);

            if (bookingTime < new Date()) {
                return { success: false, error: "Selected time has passed. Please choose a future time slot." };
            }
        }

        // ── Fetch pricing from CMS config (dynamic, admin-controlled) ─────────
        let cmsConfig: Record<string, string> = {};
        try {
            const cfgRes = await fetch(`${API_URL}/cms/session-booking-config/1/`, {
                cache: "no-store",
                signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
            });
            if (cfgRes.ok) cmsConfig = await cfgRes.json();
        } catch { /* fall through to defaults */ }

        const ADULT_PRICE = cmsConfig.adult_price ? parseFloat(cmsConfig.adult_price) : 9.95;
        const KID_PRICE = cmsConfig.kid_price ? parseFloat(cmsConfig.kid_price) : 9.95;
        const SPEC_PRICE = cmsConfig.spectator_price ? parseFloat(cmsConfig.spectator_price) : 2.95;
        const GST_RATE = cmsConfig.gst_rate ? parseFloat(cmsConfig.gst_rate) : 0;

        let subtotal =
            (data.adults * ADULT_PRICE) +
            (data.kids * KID_PRICE) +
            (data.spectators * SPEC_PRICE);

        // 120-min session = extra session fee per person
        if (data.duration === "120") {
            subtotal += (data.kids + data.adults) * ADULT_PRICE;
        }

        // ── Add-ons — prices also driven by CMS config ─────────────────────
        const ADD_ON_PRICES: Record<string, number> = {
            "skate-hire": cmsConfig.skate_hire_price ? parseFloat(cmsConfig.skate_hire_price) : 2.95,
            "bowling-shoes": cmsConfig.shoe_hire_price ? parseFloat(cmsConfig.shoe_hire_price) : 1.50,
            "locker": cmsConfig.locker_hire_price ? parseFloat(cmsConfig.locker_hire_price) : 2.00,
            "token-pack-small": cmsConfig.token_pack_20_price ? parseFloat(cmsConfig.token_pack_20_price) : 5.00,
            "token-pack-large": cmsConfig.token_pack_50_price ? parseFloat(cmsConfig.token_pack_50_price) : 10.00,
            "parking": cmsConfig.parking_price ? parseFloat(cmsConfig.parking_price) : 3.00,
        };
        const ADD_ON_META: Record<string, { label: string; emoji: string }> = {
            "skate-hire": { label: "Skate Hire", emoji: "\uD83D\uDEFC" },
            "bowling-shoes": { label: "Shoe Hire", emoji: "\uD83D\uDC5E" },
            "locker": { label: "Locker Hire", emoji: "\uD83D\uDD12" },
            "token-pack-small": { label: "Token Pack (20)", emoji: "\uD83E\uDE99" },
            "token-pack-large": { label: "Token Pack (50)", emoji: "\uD83C\uDFB0" },
            "parking": { label: "Parking", emoji: "\uD83D\uDE97" },
        };

        const formAddOns: Record<string, number> = (formData.addOns as Record<string, number>) || {};
        const formGlobalAddOns: Record<string, number> = (formData.globalAddOns as Record<string, number>) || {};
        const allAddOns = { ...formAddOns, ...formGlobalAddOns };

        const addOnsList: object[] = [];
        let addOnsTotal = 0;
        for (const [id, qty] of Object.entries(allAddOns)) {
            if (qty > 0 && ADD_ON_PRICES[id] !== undefined) {
                const priceEach = ADD_ON_PRICES[id];
                const lineTotal = parseFloat((priceEach * qty).toFixed(2));
                addOnsTotal += lineTotal;
                addOnsList.push({
                    id,
                    label: ADD_ON_META[id]?.label || id,
                    emoji: ADD_ON_META[id]?.emoji || "+",
                    qty,
                    price_each: priceEach,
                    subtotal: lineTotal,
                });
            }
        }

        subtotal = parseFloat((subtotal + addOnsTotal).toFixed(2));
        const gst = parseFloat((subtotal * (GST_RATE / 100)).toFixed(2));
        let totalAmount = parseFloat((subtotal + gst).toFixed(2));
        let discountAmount = 0;
        let voucherId = null;

        // Apply voucher if provided
        if (data.voucherCode) {
            // Re-validate voucher server-side
            const voucherRes = await fetch(`${API_URL}/shop/vouchers/?code=${data.voucherCode}`, {
                cache: "no-store"
            });

            if (!voucherRes.ok) {
                return { success: false, error: "Invalid voucher code" };
            }

            const vouchers = await voucherRes.json();
            const voucher = vouchers[0];

            if (!voucher) {
                return { success: false, error: "Invalid voucher code" };
            }

            if (!voucher.is_active) {
                return { success: false, error: "This voucher is inactive" };
            }

            // Check expiry
            if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
                return { success: false, error: "This voucher has expired" };
            }

            // Check usage limit
            if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
                return { success: false, error: "This voucher has reached its usage limit" };
            }

            // Check min order amount
            if (voucher.min_order_amount && subtotal < parseFloat(voucher.min_order_amount)) {
                return { success: false, error: `Minimum order of £${parseFloat(voucher.min_order_amount).toLocaleString()} required to use this voucher` };
            }

            // Calculate discount
            if (voucher.discount_type === "PERCENTAGE") {
                discountAmount = (subtotal * parseFloat(voucher.discount_value)) / 100;
            } else {
                discountAmount = parseFloat(voucher.discount_value);
            }

            discountAmount = Math.min(discountAmount, totalAmount);
            // Ensure 2 decimal places
            discountAmount = Number(discountAmount.toFixed(2));

            totalAmount -= discountAmount;
            voucherId = voucher.id;

            // Increment usage count
            await fetch(`${API_URL}/shop/vouchers/${voucher.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ used_count: voucher.used_count + 1 })
            });
        }

        // Generate unique booking number
        const bookingNumber = generateBookingNumber();

        // Check for duplicate bookings using the dedicated public endpoint
        const checkDuplicateRes = await fetch(
            `${API_URL}/bookings/bookings/check_duplicate/?email=${encodeURIComponent(sanitizedEmail)}&date=${data.date}&time=${data.time}`,
            { cache: "no-store" }
        );

        if (checkDuplicateRes.ok) {
            const result = await checkDuplicateRes.json();
            if (result.exists) {
                return {
                    success: false,
                    error: "A booking with these details was recently created. Please check your email or contact support."
                };
            }
        }

        // Create booking
        const bookingPayload = {
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            date: data.date,
            time: data.time,
            duration: parseInt(data.duration),
            adults: data.adults,
            kids: data.kids,
            spectators: data.spectators,
            subtotal: Number(subtotal.toFixed(2)),
            amount: Number(totalAmount.toFixed(2)),
            discount_amount: Number(discountAmount.toFixed(2)),
            voucher_code: data.voucherCode || null,
            voucher: voucherId,
            status: "CONFIRMED",
            booking_status: "CONFIRMED",
            payment_status: "PENDING",
            waiver_status: "PENDING",
            type: "SESSION",
            activity: formData.activity || null,
            add_ons: addOnsList.length > 0 ? addOnsList : null,
        };

        const bookingRes = await fetch(`${API_URL}/bookings/bookings/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingPayload)
        });

        if (!bookingRes.ok) {
            let errorMessage = "Failed to create booking";
            try {
                const errorText = await bookingRes.text();
                try {
                    const error = JSON.parse(errorText);
                    errorMessage = error.detail || "Failed to create booking";
                } catch {
                    // If parsing fails, it's likely HTML or plain text (e.g. 500 error page)
                    console.error("Non-JSON error response from booking API:", errorText.substring(0, 500));
                    errorMessage = `Server Error (${bookingRes.status}). Please try again later.`;
                }
            } catch (e) {
                console.error("Failed to read error response:", e);
            }
            return { success: false, error: errorMessage };
        }

        const booking = await bookingRes.json();

        // Create waiver ONLY if customer accepted it
        if (data.waiverAccepted) {
            const waiverPayload = {
                name: sanitizedName,
                email: sanitizedEmail,
                phone: sanitizedPhone,
                dob: data.dateOfBirth || null,
                participant_type: 'ADULT',
                is_primary_signer: true,
                version: "1.0",
                minors: data.minors || [],
                adults: data.adultGuests || [],
                booking: booking.id
            };

            await fetch(`${API_URL}/bookings/waivers/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(waiverPayload)
            });

            // Update booking waiver status to SIGNED (since waiver was just created)
            await fetch(`${API_URL}/bookings/bookings/${booking.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waiver_status: "SIGNED" })
            });
        }
        // If waiver not accepted, status stays PENDING (default)

        // Generate QR Code for the booking
        const qrData = JSON.stringify({
            id: booking.uuid || booking.id,
            name: booking.name,
            date: booking.date,
            time: booking.time,
            guests: booking.adults + booking.kids + booking.spectators
        });

        const qrCode = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });

        // Update booking with QR code
        await fetch(`${API_URL}/bookings/bookings/${booking.id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_code: qrCode })
        });

        console.log("Booking created successfully:", {
            id: booking.id,
            uuid: booking.uuid,
            bookingNumber,
            email: sanitizedEmail,
            date: data.date,
            time: data.time
        });

        revalidatePath("/admin");
        revalidatePath("/admin/bookings");

        return {
            success: true,
            bookingId: booking.uuid || booking.id,
            bookingNumber: bookingNumber
        };
    } catch (error) {
        console.error("Failed to create booking:", error);

        // Don't expose internal errors to client
        return {
            success: false,
            error: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
