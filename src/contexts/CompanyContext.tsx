// contexts/CompanyContext.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDocuments } from '../utils/Database';

// Define la interfaz para la compañía
interface Company {
  id?: string;
  name: string;
  description: string;
  logoURL: string;
  // Añade aquí cualquier otra propiedad que necesites
}

// Crea el contexto
interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  error: Error | null;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  loading: true,
  error: null
});

// Hook personalizado para usar el contexto
export const useCompany = () => useContext(CompanyContext);

// Proveedor del contexto
export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const companies = await getDocuments("company") as Company[];
        if (companies && companies.length > 0) {
          setCompany(companies[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos de la compañía:", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  return (
    <CompanyContext.Provider value={{ company, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};