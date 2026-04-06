"use client";



import { useState, useEffect } from "react";

import { useForm, FormProvider } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {

    Check, Calendar, Users, FileText, CreditCard, Download,

    ChevronRight, ChevronLeft, AlertCircle, Loader2, Sparkles,

    User, Phone, Mail, Clock, Zap, Star, Info, Plus, Minus, School

} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { bookingSchema, type BookingFormData, getAvailableTimeSlots, isTimeInPast, isSchoolHoliday } from "../lib/api/types";

import { useToast } from "./ToastProvider";

import { WaiverForm } from "./WaiverForm";

import { PaymentStep } from "./PaymentStep";

import { validateVoucher } from "../app/actions/validateVoucher";

import { PageSection } from "../lib/cms/types";

import { fetchBookingBlocks, isDateBlocked, BookingBlock } from "../lib/api/booking-blocks";

import { SmartCalendar } from "./SmartCalendar";



// --- Activity definitions -----------------------------------------------------
// NOTE: Arcade is walk-in only (tokens bought at venue). Only Skating + Bowling bookable.

const ACTIVITIES = [

    {

        id: "roller-skating",

        name: "Roller Skating",

        emoji: "\u{1F6FC}",

        tagline: "Leicester's First Skating Rink",

        description: "Glide around our spectacular indoor roller skating rink in the heart of Leicester city centre. Perfect for all ages and groups.",

        highlights: ["60-min session (extendable)", "Skate hire available \u00A32.95", "All levels welcome", "Music & disco lighting"],

        color: "from-pink-500 to-rose-600",

        accentColor: "text-pink-400",

        borderColor: "border-pink-500/40",

        bgColor: "bg-pink-500/10",

        addOns: [

            { id: "skate-hire", label: "Skate Hire", price: 2.95, description: "Quality quad skates", emoji: "\u26F8\uFE0F" },

            { id: "locker", label: "Locker Hire", price: 2.00, description: "Secure your belongings", emoji: "\u{1F512}" },

        ],

        minAge: { adults: "7+", kids: "1\u20136 yrs", note: "Under 7 must be supervised" },

    },

    {

        id: "ten-pin-bowling",

        name: "Ten Pin Bowling",

        emoji: "\u{1F3B3}",

        tagline: "Strike It Big in Leicester",

        description: "Enjoy competitive ten pin bowling on our professionally equipped lanes. Great for groups, parties or a casual night out.",

        highlights: ["Per game pricing", "Automatic scoring system", "Food & drinks at lane", "Group discounts available"],

        color: "from-blue-500 to-indigo-600",

        accentColor: "text-blue-400",

        borderColor: "border-blue-500/40",

        bgColor: "bg-blue-500/10",

        addOns: [

            { id: "bowling-shoes", label: "Shoe Hire", price: 1.50, description: "Bowling shoe rental", emoji: "\u{1F45F}" },

            { id: "locker", label: "Locker Hire", price: 2.00, description: "Secure your belongings", emoji: "\u{1F512}" },

        ],

        minAge: { adults: "7+", kids: "4\u20136 yrs", note: "Kids' bumpers available" },

    },

]



// --- Global add-ons (available for ALL activities) ---------------------------

// Prices overridden by CMS config at runtime — see GLOBAL_ADD_ONS below

interface GlobalAddOn {

    id: string;

    label: string;

    description: string;

    emoji: string;

    price: number;

    unit: string;

    maxQty: number;

    info: string;

}

const GLOBAL_ADD_ONS_BASE: GlobalAddOn[] = [

    {

        id: "parking",

        label: "Parking",

        description: "Secure car park, close to entrance. Pay at reception.",

        emoji: "\u{1F697}",

        price: 3.00,

        unit: "car",

        maxQty: 5,

        info: "Register at reception on arrival",

    },

    {

        id: "locker",

        label: "Locker Hire",

        description: "Secure your belongings. Various sizes available.",

        emoji: "\u{1F512}",

        price: 2.00,

        unit: "locker",

        maxQty: 10,

        info: "Available at the venue",

    },

]



type ActivityId = typeof ACTIVITIES[number]["id"];



// --- Opening hours for SpinPin ------------------------------------------------

const OPENING_HOURS: Record<number, { open: string; close: string } | null> = {

    0: { open: "12:00", close: "22:00" }, // Sunday  12 PM – 10 PM

    1: null,                               // Monday – closed

    2: { open: "12:00", close: "22:00" }, // Tuesday  12 PM – 10 PM

    3: { open: "12:00", close: "22:00" }, // Wednesday

    4: { open: "12:00", close: "22:00" }, // Thursday

    5: { open: "12:00", close: "22:00" }, // Friday

    6: { open: "12:00", close: "23:00" }, // Saturday 12 PM – 11 PM

};



// --- Bowling lane configuration -----------------------------------------------

const BOWLING_CONFIG = {

    totalLanes: 6,

    maxPerLane: 5,

};



function calculateBowlingLanes(totalGuests: number): number {

    if (totalGuests <= 0) return 0;

    return Math.ceil(totalGuests / BOWLING_CONFIG.maxPerLane);

}





interface BookingWizardProps {

    onSubmit: (data: any) => Promise<{ success: boolean; bookingId?: string; bookingNumber?: string; error?: string }>;

    cmsContent?: PageSection[];

}



export const BookingWizard = ({ onSubmit, cmsContent = [] }: BookingWizardProps) => {

    const [step, setStep] = useState(0); // 0=activity, 1=date/time, 2=guests, 3=details, 4=waiver, 5=summary, 6=payment

    const [selectedActivity, setSelectedActivity] = useState<ActivityId | null>(null);

    const [bookingComplete, setBookingComplete] = useState(false);

    const [bookingId, setBookingId] = useState<string>("");

    const [bookingNumber, setBookingNumber] = useState<string>("");

    const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    const { showToast } = useToast();

    const [voucher, setVoucher] = useState("");

    const [discount, setDiscount] = useState(0);

    const [voucherMessage, setVoucherMessage] = useState("");

    const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

    const [config, setConfig] = useState<any>(null);

    const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

    const [selectedGlobalAddOns, setSelectedGlobalAddOns] = useState<Record<string, number>>({});

    const [bookingBlocks, setBookingBlocks] = useState<BookingBlock[]>([]);



    const methods = useForm<BookingFormData>({

        resolver: zodResolver(bookingSchema),

        mode: "onChange",

        defaultValues: {

            date: "",

            time: "",

            duration: "60",

            adults: 1,

            kids: 0,

            spectators: 0,

            name: "",

            email: "",

            phone: "",

            waiverAccepted: false,

            dateOfBirth: "",

            dateOfArrival: "",

            minors: [],

        },

    });



    const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = methods;

    const formData = watch();



    // Load config + booking blocks

    useEffect(() => {

        fetchBookingBlocks().then(setBookingBlocks);

        (async () => {

            try {

                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

                const res = await fetch(`${API_URL}/cms/session-booking-config/1/`);

                const data = await res.json();

                setConfig(data);

            } catch {

                setConfig({

                    adult_price: "9.95",

                    kid_price: "9.95",

                    spectator_price: "2.95",

                    gst_rate: "0",

                });

            }

        })();

    }, []);



    // Update available slots when date changes

    useEffect(() => {

        if (formData.date) {

            const blockReason = isDateBlocked(formData.date, bookingBlocks);

            if (blockReason) {

                setValue("date", "", { shouldValidate: true });

                showToast("error", `This date is not available: ${blockReason}`);

                return;

            }

            const slots = getAvailableTimeSlots(formData.date);

            setAvailableSlots(slots);

            if (formData.time && !slots.includes(formData.time)) {

                setValue("time", "", { shouldValidate: true });

            }

        }

    }, [formData.date, bookingBlocks]);



    // --- Pricing (all from CMS config with fallbacks) -------------------------

    const prices = {

        adult: config ? parseFloat(config.adult_price) : 9.95,

        kid: config ? parseFloat(config.kid_price) : 9.95,

        spectator: config ? parseFloat(config.spectator_price) : 2.95,

        gstRate: config ? parseFloat(config.gst_rate) : 0,

        // Add-ons (from CMS, with GBP fallbacks)

        skateHire: config && config.skate_hire_price ? parseFloat(config.skate_hire_price) : 2.95,

        shoeHire: config && config.shoe_hire_price ? parseFloat(config.shoe_hire_price) : 1.50,

        lockerHire: config && config.locker_hire_price ? parseFloat(config.locker_hire_price) : 2.00,

        tokenPack20: config && config.token_pack_20_price ? parseFloat(config.token_pack_20_price) : 5.00,

        tokenPack50: config && config.token_pack_50_price ? parseFloat(config.token_pack_50_price) : 10.00,

        parking: config && config.parking_price ? parseFloat(config.parking_price) : 3.00,

    };



    // Build activity add-ons with CMS prices applied

    const getActivityAddOns = (activityId: string) => {

        switch (activityId) {

            case "roller-skating": return [

                { id: "skate-hire", label: "Skate Hire", price: prices.skateHire, description: "Quality quad skates", emoji: "??" },

                { id: "locker", label: "Locker Hire", price: prices.lockerHire, description: "Secure your belongings", emoji: "??" },

            ];

            case "ten-pin-bowling": return [

                { id: "bowling-shoes", label: "Shoe Hire", price: prices.shoeHire, description: "Bowling shoe rental", emoji: "??" },

                { id: "locker", label: "Locker Hire", price: prices.lockerHire, description: "Secure your belongings", emoji: "??" },

            ];

            case "arcade": return [

                { id: "token-pack-small", label: "Token Pack (20)", price: prices.tokenPack20, description: "20 game tokens", emoji: "??" },

                { id: "token-pack-large", label: "Token Pack (50)", price: prices.tokenPack50, description: "50 game tokens – best value!", emoji: "??" },

            ];

            default: return [];

        }

    };



    // Build global add-ons with CMS prices applied

    const GLOBAL_ADD_ONS = GLOBAL_ADD_ONS_BASE.map(ao => ({

        ...ao,

        price: ao.id === "parking" ? prices.parking : ao.id === "locker" ? prices.lockerHire : ao.price,

    }));



    // Build merged activity object with CMS prices

    const activity = ACTIVITIES.find(a => a.id === selectedActivity)

        ? { ...ACTIVITIES.find(a => a.id === selectedActivity)!, addOns: getActivityAddOns(selectedActivity!) }

        : undefined;



    const addOnTotal = Object.entries(selectedAddOns).reduce((sum, [id, qty]) => {

        const addOn = activity?.addOns.find(a => a.id === id);

        return sum + (addOn ? addOn.price * qty : 0);

    }, 0) + Object.entries(selectedGlobalAddOns).reduce((sum, [id, qty]) => {

        const gao = GLOBAL_ADD_ONS.find(a => a.id === id);

        return sum + (gao ? gao.price * qty : 0);

    }, 0);



    const calculateTotal = () => {

        const subtotal =

            (formData.adults * prices.adult) +

            (formData.kids * prices.kid) +

            (formData.spectators * prices.spectator) +

            addOnTotal;

        const gst = subtotal * (prices.gstRate / 100);

        return { subtotal, gst, total: subtotal + gst };

    };



    // --- Navigation -----------------------------------------------------------

    const nextStep = async () => {

        let fieldsToValidate: (keyof BookingFormData)[] = [];

        if (step === 1) fieldsToValidate = ["date", "time", "duration"];

        if (step === 2) fieldsToValidate = ["adults", "kids", "spectators"];

        if (step === 3) fieldsToValidate = ["name", "email", "phone"];

        if (step === 4) {

            fieldsToValidate = ["dateOfBirth", "dateOfArrival", "minors", "adultGuests", "waiverAccepted"];

            const ok = await trigger(fieldsToValidate);

            if (ok) {

                if ((formData.minors?.length || 0) !== formData.kids) {

                    showToast("error", `Please add details for all ${formData.kids} minor(s).`);

                    return;

                }

                const reqAdults = Math.max(0, formData.adults - 1);

                if ((formData.adultGuests?.length || 0) !== reqAdults) {

                    showToast("error", `Please add details for all ${reqAdults} additional adult(s).`);

                    return;

                }

                setStep(step + 1);

                showToast("success", "Step completed!", 2000);

            }

            return;

        }

        const ok = await trigger(fieldsToValidate);

        if (ok) { setStep(step + 1); showToast("success", "Step completed!", 2000); }

        else { showToast("error", "Please fix errors before continuing."); }

    };



    const applyVoucher = async () => {

        if (!voucher) return;

        setVoucherMessage("Validating...");

        const totals = calculateTotal();

        const bookingDateTime = formData.date && formData.time ? `${formData.date}T${formData.time}:00` : undefined;

        try {

            const result = await validateVoucher(voucher, totals.subtotal, bookingDateTime);

            if (result.success && result.discount) {

                setDiscount(result.discount);

                setAppliedVoucher(result.code || voucher);

                setVoucherMessage(`? Voucher applied: ${(result.discount / 100).toFixed(2)} off`);

                setValue("voucherCode", result.code);

                setValue("discountAmount", result.discount);

            } else {

                setDiscount(0); setAppliedVoucher(null);

                setVoucherMessage(result.error || "Invalid voucher");

                setValue("voucherCode", ""); setValue("discountAmount", 0);

            }

        } catch { setVoucherMessage("Error validating voucher"); }

    };



    const handlePayment = async (data: BookingFormData) => {

        setIsSubmitting(true);

        try {

            if (isTimeInPast(data.date, data.time)) {

                showToast("error", "Selected time has passed. Please go back and choose a future time.");

                return;

            }

            const result = await onSubmit({ ...data, activity: selectedActivity, addOns: selectedAddOns, globalAddOns: selectedGlobalAddOns });

            if (result.success && result.bookingId) {

                setBookingId(result.bookingId);

                setBookingNumber(result.bookingNumber || result.bookingId);

                setCreatedBookingId(parseInt(result.bookingId));

                await new Promise(r => setTimeout(r, 500));

                setStep(6);

                showToast("success", "Booking created! Please complete payment.");

            } else { showToast("error", result.error || "Booking failed. Please try again."); }

        } catch { showToast("error", "An unexpected error occurred."); }

        finally { setIsSubmitting(false); }

    };



    const ErrorMessage = ({ message }: { message?: string }) => {

        if (!message) return null;

        return (

            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}

                className="flex items-center gap-2 text-red-400 text-sm mt-1.5">

                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{message}</span>

            </motion.div>

        );

    };



    // --- Booking Complete -----------------------------------------------------

    if (bookingComplete) {

        const totals = calculateTotal();

        return (

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}

                className="bg-surface-800/50 backdrop-blur-md rounded-[2rem] shadow-2xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-white/10">

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}

                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}

                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">

                    <Check className="w-12 h-12 text-green-400" />

                </motion.div>

                <h2 className="text-4xl font-display font-black text-white mb-3">Booking Confirmed!</h2>

                <p className="text-white/70 mb-8 text-lg">

                    Your {activity?.name} session is booked! Tickets sent to{" "}

                    <span className="font-bold text-primary">{formData.email}</span>

                </p>

                <div className="bg-background-dark/50 rounded-2xl p-6 mb-8 text-left border border-white/10 space-y-3">

                    <div className="flex justify-between pb-3 border-b border-white/10">

                        <span className="text-white/50 text-sm font-bold uppercase">Booking Ref</span>

                        <span className="font-mono font-bold text-white">{bookingNumber}</span>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <div><span className="block text-xs text-white/50 uppercase font-bold mb-1">Activity</span>

                            <span className="font-bold text-white">{activity?.emoji} {activity?.name}</span></div>

                        <div><span className="block text-xs text-white/50 uppercase font-bold mb-1">Date</span>

                            <span className="font-bold text-white">{new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>

                        <div><span className="block text-xs text-white/50 uppercase font-bold mb-1">Time</span>

                            <span className="font-bold text-white">{formData.time}</span></div>

                        <div><span className="block text-xs text-white/50 uppercase font-bold mb-1">Guests</span>

                            <span className="font-bold text-white">{formData.adults + formData.kids + formData.spectators} people</span></div>

                        <div className="col-span-2"><span className="block text-xs text-white/50 uppercase font-bold mb-1">Amount Paid</span>

                            <span className="font-bold text-primary text-2xl">{Math.max(0, totals.total - discount / 100).toFixed(2)}</span></div>

                    </div>

                </div>

                <a href={`/tickets/${bookingId}`} target="_blank" rel="noopener noreferrer"

                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold py-4 px-8 rounded-xl shadow-lg transition-colors">

                    <Download className="w-5 h-5" /> Download Ticket

                </a>

            </motion.div>

        );

    }



    const totals = calculateTotal();



    // --- Step Labels ----------------------------------------------------------

    const steps = [

        { label: "Activity", icon: Sparkles },

        { label: "Date & Time", icon: Calendar },

        { label: "Guests", icon: Users },

        { label: "Details", icon: User },

        { label: "Waiver", icon: FileText },

        { label: "Summary", icon: CreditCard },

    ];



    return (

        <FormProvider {...methods}>

            <form onSubmit={handleSubmit(handlePayment)}>

                <div className="bg-surface-800/50 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-glass overflow-hidden max-w-5xl mx-auto border border-white/10">



                    {/* -- Progress Bar --------------------------------------- */}

                    {step > 0 && step < 6 && (

                        <div className="bg-background-dark/40 p-4 md:p-6 border-b border-white/5">

                            <div className="flex justify-between items-center max-w-3xl mx-auto gap-1 md:gap-2">

                                {steps.map((s, i) => {

                                    const Icon = s.icon;

                                    const isActive = step === i + 1;

                                    const isDone = step > i + 1;

                                    return (

                                        <div key={i} className="flex flex-col items-center gap-1 flex-1">

                                            <motion.div animate={{ scale: isActive ? 1.15 : 1 }}

                                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? "bg-green-500 border-green-500 text-white" :

                                                    isActive ? "bg-primary border-primary text-black" :

                                                        "bg-white/5 border-white/20 text-white/40"

                                                    }`}>

                                                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}

                                            </motion.div>

                                            <span className={`text-[10px] md:text-xs font-semibold hidden sm:block ${isActive ? "text-primary" : isDone ? "text-green-400" : "text-white/30"}`}>

                                                {s.label}

                                            </span>

                                        </div>

                                    );

                                })}

                            </div>

                            {/* thin progress bar */}

                            <div className="mt-4 h-1 bg-white/10 rounded-full max-w-3xl mx-auto">

                                <motion.div animate={{ width: `${((step) / steps.length) * 100}%` }}

                                    transition={{ duration: 0.4 }}

                                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />

                            </div>

                        </div>

                    )}



                    <AnimatePresence mode="wait">

                        <motion.div key={step}

                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}

                            transition={{ duration: 0.25 }}

                            className="p-6 md:p-10">



                            {/* -- STEP 0 - Choose Activity -------------------- */}

                            {step === 0 && (

                                <div>

                                    <div className="text-center mb-10">

                                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold uppercase tracking-wider mb-3">

                                            Step 1

                                        </span>

                                        <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-2">

                                            Choose Your Activity

                                        </h2>

                                        <p className="text-white/60 text-lg">What would you like to do at Spin Pin today?</p>

                                    </div>



                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                        {ACTIVITIES.map(act => (

                                            <motion.button type="button" key={act.id}

                                                whileHover={{ y: -6, scale: 1.02 }}

                                                whileTap={{ scale: 0.97 }}

                                                onClick={() => {

                                                    setSelectedActivity(act.id as ActivityId);

                                                    setSelectedAddOns({});

                                                    setSelectedGlobalAddOns({});

                                                    setStep(1);

                                                }}

                                                className={`relative text-left rounded-2xl p-6 border-2 transition-all overflow-hidden group ${selectedActivity === act.id ? `${act.borderColor} ${act.bgColor}` : "border-white/10 bg-white/5 hover:border-white/30"

                                                    }`}>

                                                {/* gradient bg blob */}

                                                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${act.color} opacity-20 group-hover:opacity-30 transition-opacity blur-xl`} />



                                                <div className="text-5xl mb-4">{act.emoji}</div>

                                                <h3 className="text-xl font-black text-white mb-1">{act.name}</h3>

                                                <p className={`text-sm font-semibold mb-3 ${act.accentColor}`}>{act.tagline}</p>

                                                <p className="text-white/60 text-sm mb-5 leading-relaxed">{act.description}</p>



                                                <ul className="space-y-1.5">

                                                    {act.highlights.map((h, i) => (

                                                        <li key={i} className="flex items-center gap-2 text-white/70 text-sm">

                                                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${act.accentColor}`} />

                                                            {h}

                                                        </li>

                                                    ))}

                                                </ul>



                                                <div className={`mt-5 flex items-center gap-2 text-sm font-bold ${act.accentColor}`}>

                                                    From {prices.adult.toFixed(2)} / person <ChevronRight className="w-4 h-4" />

                                                </div>

                                            </motion.button>

                                        ))}

                                    </div>



                                    {/* pricing quick-reference */}

                                    <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/10">

                                        <div className="flex items-center gap-2 mb-4 text-white/50 text-sm font-bold uppercase">

                                            <Info className="w-4 h-4" /> Pricing At A Glance

                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">

                                            {[

                                                { label: "Adults & Kids (7+)", price: "£9.95", note: "per session" },

                                                { label: "Kids (1–6 yrs)", price: "£9.95", note: "per session" },

                                                { label: "Spectators (4+)", price: "£2.95", note: "per person" },

                                                { label: "Under 4", price: "FREE", note: "no charge" },

                                            ].map(p => (

                                                <div key={p.label} className="bg-white/5 rounded-xl p-3">

                                                    <div className="text-xl font-black text-primary mb-1">{p.price}</div>

                                                    <div className="text-white/80 text-xs font-semibold">{p.label}</div>

                                                    <div className="text-white/40 text-xs">{p.note}</div>

                                                </div>

                                            ))}

                                        </div>

                                    </div>

                                </div>

                            )}



                            {/* -- STEP 1 - Date & Time ------------------------ */}

                            {step === 1 && (

                                <div>

                                    <div className="text-center mb-8">

                                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-bold uppercase tracking-wider mb-3">

                                            Step 2

                                        </span>

                                        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">

                                            {activity?.emoji} {activity?.name}

                                        </h2>

                                        <p className="text-white/60">Choose your date and session time</p>

                                    </div>



                                    <div className="max-w-xl mx-auto space-y-6">

                                        {/* Smart Calendar */}

                                        <div>

                                            <label className="block text-white/80 text-sm font-bold mb-3 uppercase tracking-wide">

                                                <Calendar className="inline w-4 h-4 mr-1.5" /> Select Date

                                            </label>

                                            <SmartCalendar

                                                value={formData.date}

                                                onChange={(d) => {

                                                    const blockReason = isDateBlocked(d, bookingBlocks);

                                                    if (blockReason) {

                                                        showToast("error", `This date is not available: ${blockReason}`);

                                                        return;

                                                    }

                                                    setValue("date", d, { shouldValidate: true });

                                                    setValue("time", "", { shouldValidate: false });

                                                }}

                                                bookingBlocks={bookingBlocks}

                                            />

                                            <ErrorMessage message={errors.date?.message} />

                                        </div>



                                        {/* School Holiday Banner */}

                                        {formData.date && (() => {

                                            const dow = new Date(formData.date + 'T12:00:00').getDay();

                                            const isWeekday = dow >= 2 && dow <= 5;

                                            const isHoliday = isSchoolHoliday(formData.date);

                                            if (isWeekday && isHoliday) {

                                                return (

                                                    <div className="flex items-start gap-2.5 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">

                                                        <School className="w-4 h-4 mt-0.5 flex-shrink-0" />

                                                        <span><strong>School holiday!</strong> Extended hours available today  book from as early as <strong>10:00 AM</strong>. Perfect for families! ??</span>

                                                    </div>

                                                );

                                            }

                                            if (dow === 1) {

                                                return (

                                                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">

                                                        <AlertCircle className="w-3 h-3" /> We are closed on Mondays  please pick another date.

                                                    </p>

                                                );

                                            }

                                            const hoursMap: Record<number, string> = {

                                                0: 'Sun: 12:00  22:00', 2: 'Tue: 14:00  22:00',

                                                3: 'Wed: 14:00  22:00', 4: 'Thu: 14:00  22:00',

                                                5: 'Fri: 14:00  22:00', 6: 'Sat: 12:00  23:00',

                                            };

                                            return (

                                                <p className="text-white/50 text-xs mt-2 flex items-center gap-1">

                                                    <Clock className="w-3 h-3" /> Open {hoursMap[dow]} on this day

                                                </p>

                                            );

                                        })()}



                                        {/* Time Slots */}

                                        {availableSlots.length > 0 && (

                                            <div>

                                                <label className="block text-white/80 text-sm font-bold mb-3 uppercase tracking-wide">

                                                    <Clock className="inline w-4 h-4 mr-1.5" /> Session Time

                                                </label>

                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">

                                                    {availableSlots.map(slot => (

                                                        <button type="button" key={slot}

                                                            onClick={() => setValue("time", slot, { shouldValidate: true })}

                                                            className={`py-3 rounded-xl text-sm font-bold transition-all ${formData.time === slot

                                                                ? "bg-primary text-black shadow-lg scale-105"

                                                                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/30"

                                                                }`}>

                                                            {slot}

                                                        </button>

                                                    ))}

                                                </div>

                                                <ErrorMessage message={errors.time?.message} />

                                            </div>

                                        )}



                                        {/* Duration */}

                                        <div>

                                            <label className="block text-white/80 text-sm font-bold mb-3 uppercase tracking-wide">

                                                <Zap className="inline w-4 h-4 mr-1.5" /> Session Duration

                                            </label>

                                            <div className="grid grid-cols-2 gap-3">

                                                {[

                                                    { val: "60", label: "60 Minutes", note: "Standard Session", price: "" },

                                                    { val: "120", label: "120 Minutes", note: "Extended Session", price: "+ £9.95/pp" },

                                                ].map(d => (

                                                    <button type="button" key={d.val}

                                                        onClick={() => setValue("duration", d.val as "60" | "120", { shouldValidate: true })}

                                                        className={`p-4 rounded-xl text-left border-2 transition-all ${formData.duration === d.val

                                                            ? "border-primary bg-primary/10"

                                                            : "border-white/10 bg-white/5 hover:border-white/30"

                                                            }`}>

                                                        <div className="font-black text-white">{d.label}</div>

                                                        <div className="text-white/50 text-xs mt-0.5">{d.note}</div>

                                                        {d.price && <div className="text-primary text-xs font-bold mt-1">{d.price}</div>}

                                                    </button>

                                                ))}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )}



                            {/* -- STEP 2 - Guests & Add-ons ------------------ */}

                            {step === 2 && (

                                <div>

                                    <div className="text-center mb-8">

                                        <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold uppercase tracking-wider mb-3">

                                            Step 3

                                        </span>

                                        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">

                                            Who's Coming?

                                        </h2>

                                        <p className="text-white/60">Select the number of guests in your group</p>

                                    </div>



                                    <div className="max-w-2xl mx-auto space-y-5">

                                        {/* Guest pickers */}

                                        {[

                                            {
                                                key: "adults" as const,
                                                label: activity?.minAge.adults === "Any" ? "Adults & Kids" : `Adults & Kids (${activity?.minAge.adults})`,
                                                note: `\u00A3${prices.adult.toFixed(2)} per person`,
                                                emoji: "\u{1F9D1}",
                                                min: 1,
                                            },
                                            {
                                                key: "kids" as const,
                                                label: `Young Kids (${activity?.minAge.kids})`,
                                                note: `\u00A3${prices.kid.toFixed(2)} per child`,
                                                emoji: "\u{1F476}",
                                                min: 0,
                                            },
                                            {
                                                key: "spectators" as const,
                                                label: "Spectators (Age 4+)",
                                                note: `\u00A3${prices.spectator.toFixed(2)} each \u2013 watch from viewing area`,
                                                emoji: "\u{1F440}",
                                                min: 0,
                                            },

                                        ].map(g => (

                                            <div key={g.key} className="flex items-center justify-between bg-white/5 rounded-2xl p-5 border border-white/10">

                                                <div className="flex items-center gap-4">

                                                    <span className="text-3xl">{g.emoji}</span>

                                                    <div>

                                                        <div className="font-bold text-white">{g.label}</div>

                                                        <div className="text-white/50 text-sm">{g.note}</div>

                                                    </div>

                                                </div>

                                                <div className="flex items-center gap-3">

                                                    <button type="button"

                                                        onClick={() => setValue(g.key, Math.max(g.min, (formData[g.key] || 0) - 1), { shouldValidate: true })}

                                                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all font-bold text-lg">

                                                        <Minus className="w-4 h-4" />

                                                    </button>

                                                    <span className="text-white font-black text-xl w-6 text-center">

                                                        {formData[g.key] || 0}

                                                    </span>

                                                    <button type="button"

                                                        onClick={() => setValue(g.key, (formData[g.key] || 0) + 1, { shouldValidate: true })}

                                                        className="w-9 h-9 rounded-full bg-primary/80 hover:bg-primary text-black flex items-center justify-center transition-all">

                                                        <Plus className="w-4 h-4" />

                                                    </button>

                                                </div>

                                            </div>

                                        ))}



                                        {/* Age note */}
                                        {activity?.minAge.note && (
                                            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm">
                                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                {activity.minAge.note}
                                            </div>
                                        )}

                                        {/* Bowling lane capacity info */}
                                        {selectedActivity === "ten-pin-bowling" && (formData.adults + formData.kids) > 0 && (
                                            <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-sm">
                                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-bold text-blue-200 mb-1">
                                                        🎳 Bowling Lanes: {calculateBowlingLanes(formData.adults + formData.kids)} of {BOWLING_CONFIG.totalLanes} lanes
                                                    </div>
                                                    <div className="text-blue-300/80">
                                                        Max {BOWLING_CONFIG.maxPerLane} players per lane. {formData.adults + formData.kids} total players = {calculateBowlingLanes(formData.adults + formData.kids)} lane{calculateBowlingLanes(formData.adults + formData.kids) > 1 ? 's' : ''} assigned.
                                                        {calculateBowlingLanes(formData.adults + formData.kids) > BOWLING_CONFIG.totalLanes && (
                                                            <span className="block mt-1 text-red-400 font-semibold">⚠️ Maximum {BOWLING_CONFIG.totalLanes} lanes available ({BOWLING_CONFIG.totalLanes * BOWLING_CONFIG.maxPerLane} max players). Please reduce group size.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {/* Activity-specific Add-ons */}

                                        {activity?.addOns && activity.addOns.length > 0 && (

                                            <div className="mt-6">

                                                <h3 className="text-white font-bold uppercase text-sm tracking-wider mb-3 flex items-center gap-2">

                                                    <Star className="w-4 h-4 text-primary" /> {activity.name} Add-ons

                                                </h3>

                                                <div className="space-y-3">

                                                    {activity.addOns.map(ao => (

                                                        <div key={ao.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">

                                                            <div className="flex items-center gap-3">

                                                                <span className="text-2xl">{ao.emoji}</span>

                                                                <div>

                                                                    <div className="text-white font-semibold">{ao.label}</div>

                                                                    <div className="text-white/50 text-xs">{ao.description}  {ao.price.toFixed(2)} each</div>

                                                                </div>

                                                            </div>

                                                            <div className="flex items-center gap-2">

                                                                <button type="button"

                                                                    onClick={() => setSelectedAddOns(prev => ({ ...prev, [ao.id]: Math.max(0, (prev[ao.id] || 0) - 1) }))}

                                                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">

                                                                    <Minus className="w-3 h-3" />

                                                                </button>

                                                                <span className="text-white font-bold w-5 text-center">{selectedAddOns[ao.id] || 0}</span>

                                                                <button type="button"

                                                                    onClick={() => setSelectedAddOns(prev => ({ ...prev, [ao.id]: (prev[ao.id] || 0) + 1 }))}

                                                                    className="w-8 h-8 rounded-full bg-primary/70 hover:bg-primary text-black flex items-center justify-center">

                                                                    <Plus className="w-3 h-3" />

                                                                </button>

                                                            </div>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        )}



                                        {/* -- Global Add-ons (Parking + Locker) --------- */}

                                        <div className="mt-6">

                                            <h3 className="text-white font-bold uppercase text-sm tracking-wider mb-3 flex items-center gap-2">

                                                <Star className="w-4 h-4 text-yellow-400" /> Venue Extras

                                            </h3>

                                            <div className="space-y-3">

                                                {GLOBAL_ADD_ONS.map(gao => {

                                                    const qty = selectedGlobalAddOns[gao.id] || 0;

                                                    return (

                                                        <div key={gao.id} className="bg-white/5 rounded-xl p-4 border border-white/10">

                                                            <div className="flex items-center justify-between">

                                                                <div className="flex items-center gap-3">

                                                                    <span className="text-2xl">{gao.emoji}</span>

                                                                    <div>

                                                                        <div className="text-white font-semibold">{gao.label}</div>

                                                                        <div className="text-white/50 text-xs">{gao.description}</div>

                                                                        <div className="text-primary text-xs font-bold mt-0.5">{gao.price.toFixed(2)} / {gao.unit}</div>

                                                                    </div>

                                                                </div>

                                                                {/* Quantity selector */}

                                                                <div className="flex items-center gap-2">

                                                                    <button type="button"

                                                                        onClick={() => setSelectedGlobalAddOns(prev => ({ ...prev, [gao.id]: Math.max(0, (prev[gao.id] || 0) - 1) }))}

                                                                        disabled={qty === 0}

                                                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 transition-all">

                                                                        <Minus className="w-3 h-3" />

                                                                    </button>

                                                                    <span className="text-white font-black text-lg w-6 text-center">{qty}</span>

                                                                    <button type="button"

                                                                        onClick={() => setSelectedGlobalAddOns(prev => ({ ...prev, [gao.id]: Math.min(gao.maxQty, (prev[gao.id] || 0) + 1) }))}

                                                                        disabled={qty >= gao.maxQty}

                                                                        className="w-8 h-8 rounded-full bg-yellow-500/70 hover:bg-yellow-400 text-black flex items-center justify-center disabled:opacity-30 transition-all">

                                                                        <Plus className="w-3 h-3" />

                                                                    </button>

                                                                </div>

                                                            </div>

                                                            {qty > 0 && (

                                                                <div className="mt-2 flex items-center justify-between text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">

                                                                    <span className="text-yellow-300">?? {gao.info}</span>

                                                                    <span className="font-bold text-yellow-300">{(gao.price * qty).toFixed(2)}</span>

                                                                </div>

                                                            )}

                                                        </div>

                                                    );

                                                })}

                                            </div>

                                        </div>



                                        {/* Running total */}

                                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20 flex justify-between items-center">

                                            <span className="text-white/70 font-semibold">Estimated Total</span>

                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">

                                                {totals.total.toFixed(2)}

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            )}



                            {/* -- STEP 3 - Personal Details ------------------- */}

                            {step === 3 && (

                                <div>

                                    <div className="text-center mb-8">

                                        <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold uppercase tracking-wider mb-3">

                                            Step 4

                                        </span>

                                        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">

                                            Your Details

                                        </h2>

                                        <p className="text-white/60">How do we reach you with your booking confirmation?</p>

                                    </div>



                                    <div className="max-w-lg mx-auto space-y-5">

                                        <div>

                                            <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">

                                                <User className="inline w-4 h-4 mr-1.5" /> Full Name

                                            </label>

                                            <input type="text" {...register("name")} placeholder="e.g. Jane Smith"

                                                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors" />

                                            <ErrorMessage message={errors.name?.message} />

                                        </div>

                                        <div>

                                            <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">

                                                <Mail className="inline w-4 h-4 mr-1.5" /> Email Address

                                            </label>

                                            <input type="email" {...register("email")} placeholder="jane@example.com"

                                                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors" />

                                            <ErrorMessage message={errors.email?.message} />

                                        </div>

                                        <div>

                                            <label className="block text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">

                                                <Phone className="inline w-4 h-4 mr-1.5" /> Phone Number

                                            </label>

                                            <input type="tel" {...register("phone")} placeholder="07700 900000"

                                                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors" />

                                            <ErrorMessage message={errors.phone?.message} />

                                        </div>



                                        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200 text-sm">

                                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />

                                            Your ticket and booking confirmation will be sent to your email. Please double-check it's correct.

                                        </div>

                                    </div>

                                </div>

                            )}



                            {/* -- STEP 4 - Waiver ----------------------------- */}

                            {step === 4 && (

                                <div>

                                    <div className="text-center mb-8">

                                        <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold uppercase tracking-wider mb-3">

                                            Step 5

                                        </span>

                                        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">

                                            Safety Waiver

                                        </h2>

                                        <p className="text-white/60">Please complete participant details and accept the waiver</p>

                                    </div>

                                    <WaiverForm />

                                </div>

                            )}



                            {/* -- STEP 5 - Summary & Payment ----------------- */}

                            {step === 5 && (

                                <div>

                                    <div className="text-center mb-8">

                                        <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold uppercase tracking-wider mb-3">

                                            Step 6

                                        </span>

                                        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">

                                            Review & Pay

                                        </h2>

                                        <p className="text-white/60">Double-check your booking before completing payment</p>

                                    </div>



                                    <div className="max-w-xl mx-auto space-y-5">

                                        {/* Booking Summary Card */}

                                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">

                                            {/* Activity banner */}

                                            <div className={`p-5 bg-gradient-to-r ${activity?.color} relative overflow-hidden`}>

                                                <div className="relative z-10">

                                                    <div className="text-4xl mb-1">{activity?.emoji}</div>

                                                    <h3 className="text-white font-black text-xl">{activity?.name}</h3>

                                                    <p className="text-white/80 text-sm">{activity?.tagline}</p>

                                                </div>

                                            </div>



                                            <div className="p-5 space-y-3">

                                                <div className="grid grid-cols-2 gap-3 text-sm">

                                                    <div className="bg-white/5 rounded-lg p-3">

                                                        <div className="text-white/50 text-xs mb-1">Date</div>

                                                        <div className="text-white font-bold">

                                                            {new Date(formData.date + "T12:00:00").toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}

                                                        </div>

                                                    </div>

                                                    <div className="bg-white/5 rounded-lg p-3">

                                                        <div className="text-white/50 text-xs mb-1">Time</div>

                                                        <div className="text-white font-bold">{formData.time}</div>

                                                    </div>

                                                    <div className="bg-white/5 rounded-lg p-3">

                                                        <div className="text-white/50 text-xs mb-1">Duration</div>

                                                        <div className="text-white font-bold">{formData.duration} min</div>

                                                    </div>

                                                    <div className="bg-white/5 rounded-lg p-3">

                                                        <div className="text-white/50 text-xs mb-1">Guests</div>

                                                        <div className="text-white font-bold">

                                                            {formData.adults + formData.kids + formData.spectators} total

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>



                                        {/* Price Breakdown */}

                                        <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-2.5">

                                            <h4 className="text-white/50 text-xs uppercase font-bold tracking-wider mb-3">Price Breakdown</h4>

                                            {formData.adults > 0 && (

                                                <div className="flex justify-between text-sm text-white/80">

                                                    <span>Adults/Kids (7+)  {formData.adults}</span>

                                                    <span className="font-bold">{(formData.adults * prices.adult).toFixed(2)}</span>

                                                </div>

                                            )}

                                            {formData.kids > 0 && (

                                                <div className="flex justify-between text-sm text-white/80">

                                                    <span>Young Kids (16)  {formData.kids}</span>

                                                    <span className="font-bold">{(formData.kids * prices.kid).toFixed(2)}</span>

                                                </div>

                                            )}

                                            {formData.spectators > 0 && (

                                                <div className="flex justify-between text-sm text-white/80">

                                                    <span>Spectators  {formData.spectators}</span>

                                                    <span className="font-bold">{(formData.spectators * prices.spectator).toFixed(2)}</span>

                                                </div>

                                            )}

                                            {formData.duration === "120" && (

                                                <div className="flex justify-between text-sm text-primary">

                                                    <span>Extended Session (+60 min)  {formData.adults + formData.kids}</span>

                                                    <span className="font-bold">{((formData.adults + formData.kids) * prices.adult).toFixed(2)}</span>

                                                </div>

                                            )}

                                            {/* Activity Add-ons */}

                                            {Object.entries(selectedAddOns).filter(([, q]) => q > 0).map(([id, qty]) => {

                                                const ao = activity?.addOns.find(a => a.id === id);

                                                if (!ao) return null;

                                                return (

                                                    <div key={id} className="flex justify-between text-sm text-white/80">

                                                        <span>{ao.emoji} {ao.label}  {qty}</span>

                                                        <span className="font-bold">{(ao.price * qty).toFixed(2)}</span>

                                                    </div>

                                                );

                                            })}

                                            {/* Global Add-ons: Parking + Locker */}

                                            {Object.entries(selectedGlobalAddOns).filter(([, q]) => q > 0).map(([id, qty]) => {

                                                const gao = GLOBAL_ADD_ONS.find(a => a.id === id);

                                                if (!gao) return null;

                                                return (

                                                    <div key={id} className="flex justify-between text-sm text-yellow-300/90">

                                                        <span>{gao.emoji} {gao.label}  {qty} {gao.unit}{qty > 1 ? "s" : ""}</span>

                                                        <span className="font-bold">{(gao.price * qty).toFixed(2)}</span>

                                                    </div>

                                                );

                                            })}



                                            <div className="border-t border-white/10 pt-3 mt-3">

                                                <div className="flex justify-between text-white/60 text-sm mb-1">

                                                    <span>Subtotal</span><span>{totals.subtotal.toFixed(2)}</span>

                                                </div>

                                                {totals.gst > 0 && (

                                                    <div className="flex justify-between text-white/60 text-sm mb-1">

                                                        <span>Tax</span><span>{totals.gst.toFixed(2)}</span>

                                                    </div>

                                                )}

                                                {discount > 0 && (

                                                    <div className="flex justify-between text-green-400 text-sm mb-1">

                                                        <span>Discount</span><span>- {(discount / 100).toFixed(2)}</span>

                                                    </div>

                                                )}

                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">

                                                    <span className="text-white font-black text-lg">Total</span>

                                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">

                                                        {Math.max(0, totals.total - discount / 100).toFixed(2)}

                                                    </span>

                                                </div>

                                            </div>

                                        </div>



                                        {/* Voucher */}

                                        <div className="space-y-2">

                                            <label className="text-white/70 text-sm font-bold uppercase tracking-wide block">

                                                <Sparkles className="inline w-4 h-4 mr-1 text-primary" /> Voucher / Promo Code

                                            </label>

                                            <div className="flex gap-2">

                                                <input value={voucher} onChange={e => setVoucher(e.target.value.toUpperCase())}

                                                    placeholder="Enter code"

                                                    className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors uppercase text-sm" />

                                                <button type="button" onClick={applyVoucher}

                                                    disabled={!voucher || !!appliedVoucher}

                                                    className="px-5 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-colors disabled:opacity-50 text-sm">

                                                    Apply

                                                </button>

                                            </div>

                                            {voucherMessage && (

                                                <p className={`text-sm ${voucherMessage.startsWith("?") ? "text-green-400" : "text-red-400"}`}>

                                                    {voucherMessage}

                                                </p>

                                            )}

                                        </div>



                                        {/* Submit */}

                                        <motion.button type="submit" disabled={isSubmitting}

                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}

                                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-black font-black text-lg shadow-xl disabled:opacity-60 flex items-center justify-center gap-3">

                                            {isSubmitting ? (

                                                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>

                                            ) : (

                                                <><CreditCard className="w-5 h-5" /> Pay {Math.max(0, totals.total - discount / 100).toFixed(2)}</>

                                            )}

                                        </motion.button>



                                        <p className="text-center text-white/40 text-xs">

                                            ?? Secure payment. Your data is protected. By booking you agree to our Terms & Conditions.

                                        </p>

                                    </div>

                                </div>

                            )}



                            {/* -- STEP 6 - Payment Gateway -------------------- */}

                            {step === 6 && createdBookingId && (

                                <div>

                                    <div className="text-center mb-8">

                                        <h2 className="text-3xl font-display font-black text-white mb-2">Complete Payment</h2>

                                        <p className="text-white/60">You're almost there! Complete your secure payment below.</p>

                                    </div>

                                    <PaymentStep

                                        bookingId={createdBookingId}

                                        bookingType="session"

                                        amount={Math.round(Math.max(0, totals.total - discount / 100) * 100)}

                                        bookingDetails={{

                                            date: formData.date,

                                            time: formData.time,

                                            name: formData.name,

                                            email: formData.email,

                                            phone: formData.phone,

                                            activity: selectedActivity,

                                        }}

                                        onSuccess={() => setBookingComplete(true)}

                                        onBack={() => setStep(5)}

                                    />

                                </div>

                            )}



                        </motion.div>

                    </AnimatePresence>



                    {/* -- Navigation Buttons ---------------------------------- */}

                    {step > 0 && step < 6 && (

                        <div className="px-6 md:px-10 pb-8 flex items-center justify-between border-t border-white/5 pt-6 gap-4">

                            <button type="button" onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}

                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white font-semibold transition-all">

                                <ChevronLeft className="w-4 h-4" /> Back

                            </button>



                            {step < 5 && (

                                <button type="button" onClick={nextStep}

                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-black font-black transition-all shadow-lg">

                                    Continue <ChevronRight className="w-4 h-4" />

                                </button>

                            )}

                        </div>

                    )}

                </div>

            </form>

        </FormProvider>

    );

};