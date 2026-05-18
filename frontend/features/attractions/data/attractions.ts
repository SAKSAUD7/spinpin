import { Attraction } from "@repo/types";

// SpinPin Leicester — Roller Skating, Ten Pin Bowling & Arcade
export const attractions: Attraction[] = [
    {
        id: "roller-skating",
        title: "Roller Skating",
        description: "Glide around Leicester's first indoor roller skating rink! Whether you're a seasoned skater or a first-timer, our spacious rink is the perfect place to have fun. Skate hire available at £2.95.",
        image: "/images/spinpin/unnamed (2).webp",
        category: "family",
        minAge: 1,
        intensity: "medium",
    },
    {
        id: "ten-pin-bowling",
        title: "Ten Pin Bowling",
        description: "Strike it big on our fully equipped ten pin bowling lanes. With bumpers available for younger players and an automatic scoring system, it's perfect for competitive fun with friends and family.",
        image: "/images/spinpin/unnamed (3).webp",
        category: "family",
        minAge: 4,
        intensity: "low",
    },
    {
        id: "arcade-games",
        title: "Arcade Games",
        description: "Step into the Spin Pin Arcade and rediscover the thrill of gaming! From classic redemption machines to racing simulators and VR experiences. Purchase token packs and win prizes at the redemption counter.",
        image: "/images/spinpin/unnamed (4).webp",
        category: "kids",
        minAge: 3,
        intensity: "low",
    },
    {
        id: "vr-arcade",
        title: "VR Arcade",
        description: "Immerse yourself in incredible virtual reality experiences. Explore fantastical worlds, battle enemies, and experience things you've never felt before — all within Spin Pin's state-of-the-art VR zone.",
        image: "/images/spinpin/unnamed (5).webp",
        category: "thrill",
        minAge: 8,
        intensity: "medium",
    },
    {
        id: "party-rooms",
        title: "Private Party Rooms",
        description: "Celebrate in style! Our dedicated party rooms can be booked for birthday parties, group events, and corporate gatherings. Includes table service, decorations, and dedicated party host.",
        image: "/images/spinpin/unnamed.webp",
        category: "family",
        minAge: 0,
        intensity: "low",
    },
    {
        id: "cafe-lounge",
        title: "Café & Lounge",
        description: "Refuel at the Spin Pin Café. Enjoy hot drinks, snacks, and freshly prepared food while watching the action. Our comfortable lounge area is perfect for spectators and parents.",
        image: "/images/spinpin/unnamed (1).webp",
        category: "family",
        minAge: 0,
        intensity: "low",
    },
];

export const getAttractionsByCategory = (category: Attraction["category"]) => {
    return attractions.filter((a) => a.category === category);
};

export const getAttractionById = (id: string) => {
    return attractions.find((a) => a.id === id);
};
