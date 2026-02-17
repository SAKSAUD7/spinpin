import { Attraction } from "@repo/types";

export const attractions: Attraction[] = [
    {
        id: "ninja-obstacle-course",
        title: "Ninja Obstacle Course",
        description: "Test your agility and strength on our ultimate ninja warrior-style inflatable course. Climb, jump, and conquer!",
        image: "/images/uploads/img-3.jpg",
        category: "obstacle",
        minAge: 7,
        intensity: "high",
    },
    {
        id: "giant-slides",
        title: "Giant Slides",
        description: "Experience the thrill of our massive inflatable slides. Race your friends down multiple lanes!",
        image: "/images/uploads/img-1.jpg",
        category: "thrill",
        minAge: 5,
        intensity: "high",
    },
    {
        id: "wipe-out-challenge",
        title: "Wipe-Out Challenge",
        description: "Can you stay balanced? Navigate the spinning obstacles without falling into the soft landing zone!",
        image: "/images/uploads/img-2.jpg",
        category: "thrill",
        minAge: 8,
        intensity: "high",
    },
    {
        id: "inflatable-maze",
        title: "Inflatable Maze",
        description: "Get lost in our colorful maze! Find your way through twists, turns, and surprise obstacles.",
        image: "/images/uploads/img-4.jpg",
        category: "family",
        minAge: 4,
        intensity: "low",
    },
    {
        id: "giant-jumping-balls",
        title: "Giant Jumping Balls",
        description: "Bounce to new heights on our oversized jumping balls. Perfect for all ages!",
        image: "/images/uploads/img-5.jpg",
        category: "kids",
        minAge: 3,
        intensity: "low",
    },
    {
        id: "dinosaur-guard",
        title: "Dinosaur Guard",
        description: "Navigate past the inflatable dinosaurs in this prehistoric adventure zone!",
        image: "/images/uploads/img-6.jpg",
        category: "kids",
        minAge: 3,
        intensity: "low",
    },
    {
        id: "balance-beam",
        title: "Balance Beam Challenge",
        description: "Test your balance skills on our inflatable beam. Don't fall off!",
        image: "/images/uploads/img-7.jpg",
        category: "obstacle",
        minAge: 6,
        intensity: "medium",
    },
    {
        id: "jelly-bead-zone",
        title: "Jelly Bead Zone",
        description: "Dive into thousands of soft, colorful jelly beads. A sensory experience like no other!",
        image: "/images/uploads/img-8.jpg",
        category: "kids",
        minAge: 2,
        intensity: "low",
    },
    {
        id: "climbing-wall",
        title: "Inflatable Climbing Wall",
        description: "Scale the heights on our safe, inflatable climbing wall. Reach the summit!",
        image: "/images/uploads/img-10.jpg",
        category: "obstacle",
        minAge: 7,
        intensity: "medium",
    },
    {
        id: "spider-wall",
        title: "Spider Wall",
        description: "Stick to the wall like a spider! Jump and see how high you can climb.",
        image: "/images/uploads/img-9.png",
        category: "thrill",
        minAge: 8,
        intensity: "medium",
    },
    {
        id: "wave-bed",
        title: "Wave Bed",
        description: "Ride the waves on our bouncy inflatable bed. Perfect for group fun!",
        image: "/images/uploads/img-1.jpg",
        category: "family",
        minAge: 5,
        intensity: "medium",
    },
];

export const getAttractionsByCategory = (category: Attraction["category"]) => {
    return attractions.filter((a) => a.category === category);
};

export const getAttractionById = (id: string) => {
    return attractions.find((a) => a.id === id);
};
