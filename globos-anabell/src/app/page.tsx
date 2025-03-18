"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Product from "../interfaces/Product"

const products: Product[] = [
  { id: '1', name: 'Ramo Clásico', price: 25, description: 'Un hermoso ramo clásico.', images: ['https://plus.unsplash.com/premium_photo-1710752929778-226e03a4c27f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
  { id: '2', name: 'Rosas Encanto', price: 30, description: 'Rosas encantadoras para cualquier ocasión.', images: ['/images/ramo2.jpg'] },
  { id: '3', name: 'Tulipanes Elegantes', price: 35, description: 'Tulipanes que reflejan elegancia.', images: ['/images/ramo3.jpg'] },
  { id: '4', name: 'Orquídeas Deluxe', price: 40, description: 'Orquídeas premium para un toque especial.', images: ['/images/ramo4.jpg'] },
  { id: '5', name: 'Ramo Variado', price: 28, description: 'Variedad de flores en un solo ramo.', images: ['/images/ramo5.jpg'] },
  { id: '6', name: 'Girasoles Brillantes', price: 22, description: 'Girasoles llenos de energía y color.', images: ['/images/ramo6.jpg'] },
  { id: '7', name: 'Rosas y Lirios', price: 32, description: 'Combinación perfecta de rosas y lirios.', images: ['/images/ramo7.jpg'] },
  { id: '8', name: 'Jardín Silvestre', price: 38, description: 'Un bouquet con esencia silvestre.', images: ['/images/ramo8.jpg'] },
  { id: '9', name: 'Bouquet Primaveral', price: 27, description: 'Flores frescas y coloridas.', images: ['/images/ramo9.jpg'] },
  { id: '10', name: 'Amor en Flores', price: 45, description: 'Expresa amor con este hermoso ramo.', images: ['/images/ramo10.jpg'] }
];

export default function Home() {
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<Product[]>([]);
  const itemsPerPage = 10;
  const paginatedProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="bg-white min-h-screen px-32">
      <header className="inline-flex justify-between text-center p-6 w-full border-b-4 border-black">
        <h1 className="text-4xl font-bold">Globos Anabell</h1>
        <Link href="/checkout" className="bg-blue-300 px-4 py-2 rounded-lg shadow-md">Ir al Carrito ({cart.length})</Link>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="text-center">
          <p className="text-lg my-4">Hermosos arreglos florales para cualquier ocasión.</p>
          <img src="/images/tienda.jpg" alt="Imagen de la tienda" className="mx-auto rounded-2xl shadow-lg" />
          <p className="mt-4">Visítanos en: Calle Flor, 123, Madrid</p>
          <a href="https://www.google.com/maps?q=Calle+Flor+123,Madrid" 
             target="_blank" rel="noopener noreferrer" 
             className="inline-block bg-blue-300 text-black font-bold px-4 py-2 mt-2 rounded-lg shadow-md">
            Ver en Google Maps
          </a>
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-4">Nuestros Productos</h2>
          <div className="grid grid-cols-2 gap-4">
            {paginatedProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-lg text-center">
                <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-lg" />
                <h3 className="text-lg font-bold mt-2">{product.name}</h3>
                <p className="text-blue-600">€{product.price}</p>
                <button onClick={() => addToCart(product)} 
                        className="bg-yellow-500 text-black font-bold px-4 py-2 mt-2 rounded-lg shadow-md">
                  Agregar al Carrito
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setPage(page - 1)} 
              disabled={page === 1} 
              className="px-4 py-2 bg-blue-300 rounded-lg shadow-md disabled:opacity-50">
              Anterior
            </button>
            <button 
              onClick={() => setPage(page + 1)} 
              disabled={page * itemsPerPage >= products.length} 
              className="px-4 py-2 bg-blue-300 rounded-lg shadow-md disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
