"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDocuments } from '../utils/Utils';
import Company from "../interfaces/Company"

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

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company>({
    id: "",
    name: "Cargando...",
    description: "Cargando...",
    phone: "Cargando...",
    logoURL: "https://i.imgur.com/fJwVCpH.png",
    location: "Cargando...",
    locationMaps: "Cargando...",
    instagram: "Cargando...",
    isOpen: false,
    weekdaySchedule: "Cargando...",
    weekendSchedule: "Cargando...",
  });
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