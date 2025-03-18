import { Timestamp } from "firebase/firestore"

interface Sale {
    id: string;
    name: string;
    email: string;
    phone: string;
    DNI: string;
    location: string;
    product: [{
        id: string;
        name: string;
        price: number;
        amount: number;
    }]
    createdAt: Timestamp;
}

export default Sale;