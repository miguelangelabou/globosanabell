import { Timestamp } from "firebase/firestore";

interface Company {
    id: string;
    name: string;
    description: string;
    logoURL: string;
    openHour: Timestamp;
    closeHour: Timestamp;
    whatsapp: string;
    instagram: string;
    location: string;
    locationMaps: string;
    isOpen: boolean;
    availabilityToday: boolean;
    paymentAccount: string;
}

export default Company;