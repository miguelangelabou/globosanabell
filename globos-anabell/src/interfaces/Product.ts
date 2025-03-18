interface Product {
    id: string;
    name: string;
    price: number;
    soldTimes: number
    active: boolean;
    description: string;
    images: string[];
}

export default Product;