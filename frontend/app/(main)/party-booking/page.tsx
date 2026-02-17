import { getPageSections } from "../../actions/page-sections";
import PartyBookingWizard from "./PartyBookingWizard";

export const dynamic = "force-dynamic";

export default async function PartyBookingPage() {
    const cmsContent = await getPageSections('booking-party');
    return <PartyBookingWizard cmsContent={cmsContent} />;
}
