import { Timestamp } from "firebase/firestore";

interface Company {
    id: string;
    name: string;
    description: string;
    phone: string;
    logoURL: string;
    weekdaySchedule: string;
    weekendSchedule: string;
    instagram: string;
    location: string;
    locationMaps: string;
    isOpen: boolean;
    paymentAccount: string;
}

export default Company;