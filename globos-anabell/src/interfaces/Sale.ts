import { Timestamp } from "firebase/firestore"

interface Sale {
    id: string;
    name: string;
    phone: string;
    location: string;
    product: [{
        id: string;
        name: string;
        price: number;
        amount: number;
    }]
}