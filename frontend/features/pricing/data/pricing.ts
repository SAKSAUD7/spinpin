import { PricingTier } from "@repo/types";

export const weekdayPricing: PricingTier[] = [
    {
        id: "kids-weekday",
        title: "Kids (1-7 years)",
        price: 299,
        duration: 60,
        type: "weekday",
        features: [
            "1 Hour Unlimited Play",
            "Access to Kids Zone",
            "Safety Equipment Included",
            "Trained Staff Supervision",
        ],
    },
    {
        id: "adults-weekday",
        title: "Kids & Adults (7+ years)",
        price: 399,
        duration: 60,
        type: "weekday",
        isPopular: true,
        features: [
            "1 Hour Unlimited Play",
            "All Attractions Access",
            "Ninja Obstacle Course",
            "Giant Slides & More",
            "Safety Equipment Included",
        ],
    },
    {
        id: "spectator-weekday",
        title: "Spectator",
        price: 99,
        duration: 60,
        type: "weekday",
        features: [
            "Entry to Viewing Area",
            "Café Access",
            "Wi-Fi Access",
            "Comfortable Seating",
        ],
    },
];

export const weekendPricing: PricingTier[] = [
    {
        id: "kids-weekend",
        title: "Kids (1-7 years)",
        price: 349,
        duration: 60,
        type: "weekend",
        features: [
            "1 Hour Unlimited Play",
            "Access to Kids Zone",
            "Safety Equipment Included",
            "Trained Staff Supervision",
        ],
    },
    {
        id: "adults-weekend",
        title: "Kids & Adults (7+ years)",
        price: 449,
        duration: 60,
        type: "weekend",
        isPopular: true,
        features: [
            "1 Hour Unlimited Play",
            "All Attractions Access",
            "Ninja Obstacle Course",
            "Giant Slides & More",
            "Safety Equipment Included",
        ],
    },
    {
        id: "spectator-weekend",
        title: "Spectator",
        price: 99,
        duration: 60,
        type: "weekend",
        features: [
            "Entry to Viewing Area",
            "Café Access",
            "Wi-Fi Access",
            "Comfortable Seating",
        ],
    },
];

export const addOns = [
    { id: "extra-hour", title: "Extra 1 Hour", price: 200 },
    { id: "ninja-socks", title: "Ninja Grip Socks", price: 50 },
    { id: "locker", title: "Secure Locker", price: 50 },
    { id: "photo-package", title: "Photo Package", price: 299 },
];
