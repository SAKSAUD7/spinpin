"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

interface PartyBookingPDFProps {
  booking: {
    id?: number;
    uuid?: string;
    booking_number?: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    package_name?: string;
    kids?: number;
    adults?: number;
    spectators?: number;
    birthday_child_name?: string;
    birthday_child_age?: number;
    amount: number | string;
    paid_amount?: number | string;
    special_requests?: string;
    dietary_restrictions?: string;
    status?: string;
    payment_status?: string;
    created_at?: string;
  };
  className?: string;
}

export function PartyBookingPDF({ booking, className = "" }: PartyBookingPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const PAGE_W = 210;
      const MARGIN = 16;
      const CONTENT_W = PAGE_W - MARGIN * 2;
      let y = 0;

      // ── HELPER FUNCTIONS ─────────────────────────────────────────────────
      const safeNum = (v: any) => Number(v || 0);
      const fmt = (v: any) => `£${safeNum(v).toFixed(2)}`;
      const addLine = (label: string, value: string, yPos: number, labelColor = [120, 120, 120] as [number,number,number], valueColor = [30, 30, 30] as [number,number,number]) => {
        doc.setFontSize(9).setTextColor(...labelColor);
        doc.text(label, MARGIN, yPos);
        doc.setFontSize(9).setTextColor(...valueColor);
        doc.text(value, MARGIN + 55, yPos);
        return yPos + 6;
      };

      // ── HEADER BAR ────────────────────────────────────────────────────────
      doc.setFillColor(255, 215, 0); // Gold
      doc.rect(0, 0, PAGE_W, 30, "F");
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 28, PAGE_W, 3, "F");

      doc.setFontSize(22).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text("SPIN PIN LEICESTER", MARGIN, 13);
      doc.setFontSize(9).setTextColor(40, 40, 40).setFont("helvetica", "normal");
      doc.text("Merlin Works, 8 Exploration Dr, Leicester LE4 5FX", MARGIN, 20);
      doc.text("Tel: 07349 110865  |  info@spinpin.co.uk  |  spinpin.co.uk", MARGIN, 26);

      // ── BOOKING CONFIRMATION TITLE ────────────────────────────────────────
      y = 38;
      doc.setFontSize(18).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text("PARTY BOOKING CONFIRMATION", PAGE_W / 2, y, { align: "center" });

      // Ref + Date strip
      y += 7;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(MARGIN, y, CONTENT_W, 12, 3, 3, "F");
      doc.setFontSize(9).setTextColor(80, 80, 80).setFont("helvetica", "normal");
      const refNum = booking.booking_number || booking.uuid?.slice(0, 8).toUpperCase() || String(booking.id || "N/A");
      doc.text(`Booking Ref: ${refNum}`, MARGIN + 4, y + 7.5);
      const issuedDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
      doc.text(`Issued: ${issuedDate}`, PAGE_W - MARGIN - 4, y + 7.5, { align: "right" });

      // ── CUSTOMER DETAILS ──────────────────────────────────────────────────
      y += 18;
      doc.setFillColor(0, 0, 0);
      doc.setFontSize(11).setTextColor(255, 215, 0).setFont("helvetica", "bold");
      doc.text("CUSTOMER DETAILS", MARGIN, y);
      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, y + 2, MARGIN + CONTENT_W, y + 2);

      y += 8;
      doc.setFont("helvetica", "normal").setTextColor(30, 30, 30);
      y = addLine("Full Name:", booking.name, y);
      y = addLine("Email:", booking.email, y);
      y = addLine("Phone:", booking.phone, y);
      if (booking.birthday_child_name) {
        y = addLine("Birthday Child:", `${booking.birthday_child_name}${booking.birthday_child_age ? ` (Age ${booking.birthday_child_age})` : ""}`, y);
      }

      // ── PARTY DETAILS ────────────────────────────────────────────────────
      y += 4;
      doc.setFontSize(11).setTextColor(255, 215, 0).setFont("helvetica", "bold");
      doc.text("PARTY DETAILS", MARGIN, y);
      doc.setDrawColor(255, 215, 0);
      doc.line(MARGIN, y + 2, MARGIN + CONTENT_W, y + 2);

      y += 8;
      doc.setFont("helvetica", "normal").setTextColor(30, 30, 30);
      const partyDate = booking.date
        ? new Date(booking.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "TBC";
      y = addLine("Party Date:", partyDate, y);
      y = addLine("Preferred Time:", booking.time || "TBC", y);
      y = addLine("Package:", booking.package_name || "Standard Package", y);
      y = addLine("Participants:", `${safeNum(booking.kids)} guests`, y);
      if (safeNum(booking.spectators) > 0) {
        y = addLine("Spectators:", `${booking.spectators} (first 2 free)`, y);
      }

      if (booking.special_requests) {
        y += 2;
        doc.setFontSize(9).setTextColor(80, 80, 80).setFont("helvetica", "bold");
        doc.text("Special Requests:", MARGIN, y);
        y += 5;
        doc.setFont("helvetica", "normal").setTextColor(50, 50, 50).setFontSize(8);
        const reqLines = doc.splitTextToSize(booking.special_requests, CONTENT_W);
        doc.text(reqLines, MARGIN, y);
        y += reqLines.length * 5;
      }
      if (booking.dietary_restrictions) {
        y += 2;
        doc.setFontSize(9).setTextColor(80, 80, 80).setFont("helvetica", "bold");
        doc.text("Dietary Requirements:", MARGIN, y);
        y += 5;
        doc.setFont("helvetica", "normal").setTextColor(50, 50, 50).setFontSize(8);
        const dietLines = doc.splitTextToSize(booking.dietary_restrictions, CONTENT_W);
        doc.text(dietLines, MARGIN, y);
        y += dietLines.length * 5;
      }

      // ── PRICING BREAKDOWN ────────────────────────────────────────────────
      y += 4;
      doc.setFontSize(11).setTextColor(255, 215, 0).setFont("helvetica", "bold");
      doc.text("PRICING BREAKDOWN", MARGIN, y);
      doc.setDrawColor(255, 215, 0);
      doc.line(MARGIN, y + 2, MARGIN + CONTENT_W, y + 2);

      y += 8;
      doc.setFont("helvetica", "normal").setTextColor(30, 30, 30).setFontSize(9);

      const total = safeNum(booking.amount);
      const paidAmt = safeNum(booking.paid_amount);
      const deposit = total * 0.5;
      const balance = Math.max(0, total - paidAmt);

      // Pricing table
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(MARGIN, y - 3, CONTENT_W, 36, 2, 2, "F");

      y = addLine(`Party Package (${safeNum(booking.kids)} guests):`, fmt(total), y);
      y = addLine("VAT:", "Included in price", y);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(MARGIN + 2, y, MARGIN + CONTENT_W - 2, y);
      y += 3;

      doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(0, 0, 0);
      doc.text("TOTAL:", MARGIN + 2, y);
      doc.setTextColor(180, 140, 0);
      doc.text(fmt(total), MARGIN + CONTENT_W - 2, y, { align: "right" });
      y += 7;

      doc.setFontSize(9).setFont("helvetica", "normal");
      doc.setTextColor(200, 80, 0);
      doc.text(`50% Deposit Required: ${fmt(deposit)}`, MARGIN + 2, y);
      y += 5;
      doc.setTextColor(paidAmt > 0 ? 20 : 80, paidAmt > 0 ? 140 : 80, 20);
      doc.text(`Amount Paid: ${fmt(paidAmt)}`, MARGIN + 2, y);
      y += 5;
      if (balance > 0) {
        doc.setTextColor(200, 80, 0);
        doc.text(`Balance Due on Day: ${fmt(balance)}`, MARGIN + 2, y);
        y += 5;
      }

      // ── STATUS BADGE ─────────────────────────────────────────────────────
      y += 4;
      const status = (booking.status || "PENDING").toUpperCase();
      const statusColors: Record<string, [number, number, number]> = {
        CONFIRMED: [39, 174, 96],
        PENDING: [230, 126, 34],
        CANCELLED: [192, 57, 43],
        COMPLETED: [41, 128, 185],
      };
      const [sr, sg, sb] = statusColors[status] || statusColors.PENDING;
      doc.setFillColor(sr, sg, sb);
      doc.roundedRect(MARGIN, y - 1, 40, 9, 2, 2, "F");
      doc.setFontSize(9).setTextColor(255, 255, 255).setFont("helvetica", "bold");
      doc.text(`Status: ${status}`, MARGIN + 20, y + 5, { align: "center" });

      // ── TERMS & CONDITIONS ────────────────────────────────────────────────
      y += 16;
      doc.setFontSize(10).setTextColor(255, 215, 0).setFont("helvetica", "bold");
      doc.text("TERMS & CONDITIONS", MARGIN, y);
      doc.setDrawColor(255, 215, 0);
      doc.line(MARGIN, y + 2, MARGIN + CONTENT_W, y + 2);

      const terms = [
        "• 50% non-refundable deposit required to confirm booking.",
        "• Minimum 10 participants required.",
        "• Full balance must be paid before the party begins.",
        "• Free rescheduling available with 2+ weeks notice.",
        "• Rescheduling with less than 2 weeks notice: £50 fee applies.",
        "• Extra time available at £5 per 15 minutes (subject to availability).",
        "• All guests must sign the Spin Pin waiver before participating.",
        "• No sparkler candles, glitter, or loose confetti allowed on premises.",
        "• Spin Pin reserves the right to refuse entry if T&Cs are not followed.",
      ];
      y += 7;
      doc.setFontSize(8).setTextColor(60, 60, 60).setFont("helvetica", "normal");
      terms.forEach((term) => {
        doc.text(term, MARGIN, y);
        y += 5;
      });

      // ── FOOTER ───────────────────────────────────────────────────────────
      const footerY = 285;
      doc.setFillColor(0, 0, 0);
      doc.rect(0, footerY - 4, PAGE_W, 16, "F");
      doc.setFontSize(8).setTextColor(255, 215, 0).setFont("helvetica", "bold");
      doc.text("SPIN PIN LEICESTER", PAGE_W / 2, footerY + 1, { align: "center" });
      doc.setTextColor(180, 180, 180).setFont("helvetica", "normal");
      doc.text("Merlin Works, 8 Exploration Dr, Leicester LE4 5FX  |  07349 110865  |  info@spinpin.co.uk", PAGE_W / 2, footerY + 6, { align: "center" });

      // ── SAVE ─────────────────────────────────────────────────────────────
      const fileName = `SpinPin-Party-${refNum}-${booking.name.replace(/\s+/g, "-")}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={isGenerating}
      className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-400/30 disabled:opacity-60 disabled:cursor-not-allowed text-sm ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" aria-hidden="true" />
          <FileText className="w-4 h-4" aria-hidden="true" />
          Download Booking PDF
        </>
      )}
    </button>
  );
}
