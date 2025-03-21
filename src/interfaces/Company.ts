import { Timestamp } from "firebase/firestore";

interface Company {
    id: string;
    name: string;
    description: string;
    phone: string;
    logoURL: string;
    openHour: Timestamp | null;
    closeHour: Timestamp | null;
    openHourFormatted?: string;
    closeHourFormatted?: string;
    whatsapp: string;
    instagram: string;
    location: string;
    locationMaps: string;
    isOpen: boolean;
    availabilityToday: boolean;
    paymentAccount: string;
}

export default Company;