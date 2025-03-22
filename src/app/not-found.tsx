"use client"
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Image from "next/image"
import { useRouter } from 'next/navigation';
import { getDocuments } from '../utils/Database';
import Company from "../interfaces/Company"

export default function NotFound() {
    const router = useRouter();
    const [company, setCompany] = useState<Company>();

    useEffect(() => {
        const loadCompanyData = async () => {
        try {
            const companies = await getDocuments("company") as Company[];
            if (companies && companies.length > 0) {
            setCompany(companies[0]);
            }
        } catch (error) {
            console.error("Error cargando datos de la compañía:", error);
        }
        };
        
        loadCompanyData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
            <div className="mb-6">
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
                className="h-16 w-16 text-red-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12"
                />
                </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Página no encontrada
            </h1>
            
            <p className="text-gray-600 mb-8">
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
            
            <div className="flex flex-col space-y-4">
                <button 
                onClick={() => router.back()}
                className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                Volver atrás
                </button>
                
                <button 
                onClick={()=>router.push("/")}
                className="w-full flex justify-center cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                Ir a la página principal
                </button>
            </div>
            </div>
        </div>
    );
}