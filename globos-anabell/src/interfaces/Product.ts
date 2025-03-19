interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    soldTimes: number
    active: boolean;
    imageURL: string;
}

export default Product;