import { Timestamp } from "firebase/firestore";

interface Company {
    id: string;
    name: string;
    description: string;
    photoURL: string;
    bannerURL: string;
    openHour: Timestamp;
    closeHour: Timestamp;
    location: string;
    locationMaps: string;
    isOpen: boolean;
    paymentAccount: string;
}

export default Company;