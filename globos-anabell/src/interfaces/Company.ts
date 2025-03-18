import { Timestamp } from "firebase/firestore";

interface Company {
    id: string;
    name: string;
    description: string;
    logoURL: string;
    bannerURL: string;
    openHour: Timestamp;
    closeHour: Timestamp;
    location: string;
    locationMaps: string;
    isOpen: boolean;
    availabilityToday: boolean;
    paymentAccount: string;
}

export default Company;