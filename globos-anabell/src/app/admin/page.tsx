"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import { getDocuments, getDocument, addDocument, deleteDocument, updateDocument } from "../../utils/Database";
import Product from "../../interfaces/Product";
import Company from "../../interfaces/Company";

const Admin = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<Product>({ 
    id: "",
    name: "", 
    price: 0, 
    description: "", 
    soldTimes: 0,
    images: [""], 
    active: true 
  });
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const initialProducts = await getDocuments("products") as Product[];
          const initialCompany = await getDocument("company", user.uid) as Company;
          setProducts(initialProducts);
          setCompany(initialCompany);
        } catch (err) {
          setError("Error al cargar los datos.");
        }
      };
      fetchData();
    }
  }, [user]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Administrar Productos y Empresa</h1>
      {company && <p className="text-lg text-center">Empresa: {company.name}</p>}
      <h2 className="text-2xl font-semibold mb-4">Lista de Productos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className={`bg-white p-4 rounded-lg shadow-lg ${product.active ? "" : "opacity-50"}`}>
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p>Precio: €{product.price}</p>
            <p>{product.description}</p>
            <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
