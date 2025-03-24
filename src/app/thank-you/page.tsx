"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany } from '../../contexts/CompanyContext';
import Product from "../../interfaces/Product"
import Image from "next/image";

const ThankYouPage = () => {
  const { company, loading } = useCompany();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<{
    cart: {product: Product, quantity: number}[];
    timestamp: string;
    total: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder');

    if (pendingOrder) {
      setOrderDetails(JSON.parse(pendingOrder));
    }
    
    localStorage.removeItem('pendingOrder');
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && (!orderDetails || orderDetails.cart.length === 0)) {
      router.push("/");
    }
  }, [orderDetails, isLoaded, router]);

  if (!isLoaded || !orderDetails || orderDetails.cart.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="px-8 py-10">
          <div className="text-center">
            {company && (
              <Image
                src={company?.logoURL} 
                alt="Logo" 
                className="rounded-full w-32 h-32 mx-auto"
                width={128}
                height={128}
                />
            )}

            <svg 
              className="h-12 w-12 text-green-500 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
            
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              ¡Gracias por tu pedido!
            </h1>
            
            <p className="mt-2 text-gray-600">
              Se ha creado un mensaje de WhatsApp con los detalles de tu pedido. 
              Nos pondremos en contacto contigo lo antes posible para confirmar tu pedido.
            </p>
            
            <div className="mt-6 border-t border-gray-200 pt-6 text-left">
              <h2 className="text-lg font-medium text-gray-900">Resumen del pedido</h2>
              <ul className="mt-2 divide-y divide-gray-200">
                {orderDetails.cart.map((item, index) => (
                  <li key={index} className="py-3 flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-between">
                <p className="text-sm font-medium text-gray-900">Total</p>
                <p className="text-sm font-medium text-gray-900">
                  €{orderDetails.total.toFixed(2)}
                </p>
              </div>
              <p className='text-sm text-gray-500 text-center mt-6 w-full'>Total sin incluir precio de envios ni descuentos</p>
            </div>
            
            <div className="mt-2 flex flex-col space-y-4">
              <button 
                className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => router.push("/")}
              >
                Volver a la tienda
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full flex justify-center py-2 px-4 border cursor-pointer border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Imprimir resumen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;