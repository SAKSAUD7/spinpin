import { z } from "zod";
import { isAfter, isBefore, startOfDay, addHours } from "date-fns";

// ─── Leicester City Council School Holiday Dates 2025–2027 ──────────────────
// Source: Leicester City Council & Leicestershire County Council calendars
// These are DATE RANGES where schools are CLOSED (holidays/half-terms).
// On these days, weekday opening hours extend to match weekend hours (from 10:00).
const SCHOOL_HOLIDAY_RANGES: Array<[string, string]> = [
    // 2025
    ["2025-05-26", "2025-05-30"], // Spring half-term
    ["2025-07-23", "2025-08-31"], // Summer holiday
    ["2025-10-20", "2025-10-24"], // Autumn half-term
    ["2025-12-20", "2026-01-04"], // Christmas & New Year
    // 2026 (Leicester City Council 2026/27)
    ["2026-02-16", "2026-02-20"], // Spring half-term
    ["2026-03-30", "2026-04-10"], // Easter holidays
    ["2026-05-25", "2026-05-29"], // Summer half-term
    ["2026-07-22", "2026-08-30"], // Summer holiday + Bank Holiday 31 Aug
    ["2026-10-19", "2026-10-23"], // Autumn half-term
    ["2026-12-19", "2027-01-03"], // Christmas & New Year
    // 2027
    ["2027-02-15", "2027-02-19"], // Spring half-term
    ["2027-03-22", "2027-04-02"], // Easter holidays
    ["2027-05-31", "2027-06-04"], // Summer half-term
    ["2027-07-12", "2027-08-31"], // Summer holiday
];

/**
 * Returns true if the given date (YYYY-MM-DD) falls within a school holiday period.
 * During school holidays, SpinPin opens earlier on weekdays (like weekends).
 */
export function isSchoolHoliday(date: string): boolean {
    if (!date) return false;
    for (const [start, end] of SCHOOL_HOLIDAY_RANGES) {
        if (date >= start && date <= end) return true;
    }
    return false;
}

export interface Stat {
    id: string;
    value: string;
    label: string;
    icon: string;
}

export interface GalleryItem {
    id: string;
    src: string;
    title: string;
    desc: string;
}

export interface Review {
    id: string;
    url: string;
    img: string;
}

export interface Activity {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    active: boolean;
    order: number;
}

// Phone number validation - accepts UK and international formats
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// Email validation (comprehensive)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const bookingSchema = z.object({
    // Session Details
    date: z.string()
        .min(1, "Please select a date")
        // .refine((date) => {
        //     try {
        //         // Parse date string (yyyy-mm-dd) manually to ensure local time comparison
        //         const parts = date.split('-');
        //         if (parts.length !== 3) return false;
        //         const selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        //         const today = new Date();
        //         today.setHours(0, 0, 0, 0);
        //         return selectedDate >= today;
        //     } catch {
        //         return false;
        //     }
        // }, "Cannot book for past dates")
        .refine((date) => {
            try {
                const selectedDate = new Date(date);
                const maxDate = addHours(new Date(), 24 * 90); // 90 days in advance
                return isBefore(selectedDate, maxDate);
            } catch {
                return false;
            }
        }, "Bookings can only be made up to 90 days in advance"),

    time: z.string()
        .min(1, "Please select a time slot"),

    duration: z.enum(["60", "120"]),

    // Guest Details
    adults: z.number()
        .min(0, "Cannot be negative")
        .max(50, "Maximum 50 adults per booking"),

    kids: z.number()
        .min(0, "Cannot be negative")
        .max(50, "Maximum 50 kids per booking"),

    spectators: z.number()
        .min(0, "Cannot be negative")
        .max(50, "Maximum 50 spectators per booking"),

    // Personal Details
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name is too long")
        .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens and apostrophes")
        .transform((name) => name.trim()),

    email: z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .regex(emailRegex, "Please enter a valid email address")
        .toLowerCase()
        .transform((email) => email.trim()),

    phone: z.string()
        .min(1, "Phone number is required")
        .regex(phoneRegex, "Please enter a valid phone number")
        .transform((phone) => phone.trim()),

    // Waiver Details
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    dateOfArrival: z.string().min(1, "Date of arrival is required"),
    minors: z.array(z.object({
        name: z.string().min(1, "Minor name is required"),
        dob: z.string().min(1, "Minor DOB is required")
    })).optional(),
    adultGuests: z.array(z.object({
        name: z.string().min(1, "Adult name is required"),
        email: z.string().email("Valid email required"),
        phone: z.string().min(10, "Valid phone required"),
        dob: z.string().min(1, "Adult DOB is required")
    })).optional(),
    voucherCode: z.string().optional(),
    discountAmount: z.number().optional(),

    // Waiver
    waiverAccepted: z.boolean()
        .refine((val) => val === true, "You must accept the waiver to proceed")
}).refine((data) => {
    // At least one participant (adult or kid) must be selected
    return data.adults > 0 || data.kids > 0;
}, {
    message: "At least one participant (adult or kid) is required for booking",
    path: ["adults"]
}).refine((data) => {
    // Total guests should not exceed 100
    const totalGuests = data.adults + data.kids + data.spectators;
    return totalGuests <= 100;
}, {
    message: "Total guests cannot exceed 100 per booking",
    path: ["spectators"]
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Helper function to format phone number
export function formatPhoneNumber(phone: string): string {
    return phone.trim();
}

// Helper function to check if selected time is in the past
export function isTimeInPast(date: string, time: string): boolean {
    if (!date || !time) return false;
    try {
        const selectedDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        selectedDate.setHours(hours, minutes || 0, 0, 0);
        const now = new Date();
        return isBefore(selectedDate, now);
    } catch {
        return false;
    }
}

// Helper to validate if a date is a valid booking date
export function isValidBookingDate(date: string): boolean {
    try {
        const selectedDate = new Date(date);
        const today = startOfDay(new Date());
        const maxDate = addHours(new Date(), 24 * 90);
        return (isAfter(selectedDate, today) || selectedDate.getTime() === today.getTime())
            && isBefore(selectedDate, maxDate);
    } catch {
        return false;
    }
}

// Get available time slots for a given date based on SpinPin UK opening hours:
// Mon: Closed
// Tue-Fri (term-time): 14:00-22:00
// Updated hours:
// Monday: CLOSED
// Tue-Fri: 12:00 PM – 10:00 PM (also open in school holidays)
// Sat: 12:00 PM – 11:00 PM
// Sun: 12:00 PM – 10:00 PM
// For today's date, only show slots at least 2 hours from now
export function getAvailableTimeSlots(date: string): string[] {
    const selectedDate = new Date(date + 'T12:00:00');
    const dayOfWeek = selectedDate.getDay(); // 0=Sun, 1=Mon, 2=Tue...

    // Monday is always closed
    if (dayOfWeek === 1) return [];

    let allSlots: string[];

    if (dayOfWeek === 6) {
        // Saturday: 12:00 PM – 11:00 PM
        allSlots = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
    } else if (dayOfWeek === 0) {
        // Sunday: 12:00 PM – 10:00 PM
        allSlots = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
    } else {
        // Tue-Fri: 12:00 PM – 10:00 PM (same for school holidays — open all week except Mon)
        allSlots = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
    }

    // For today's date, only show slots at least 2 hours from now
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        // Must be at least 2 hours from now
        const minSlotHour = currentMinute > 0 ? currentHour + 3 : currentHour + 2;
        return allSlots.filter(slot => {
            const [slotHour] = slot.split(':').map(Number);
            return slotHour >= minSlotHour;
        });
    }
    return allSlots;
}
