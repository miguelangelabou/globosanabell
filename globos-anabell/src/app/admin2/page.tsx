"use client";
import { useState, useEffect } from 'react';
import { Timestamp } from "firebase/firestore";
import { auth } from "../../config/firebaseConfig"
import { AuthProvider } from "../../contexts/AuthContext";
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from 'next/navigation';
import Product from "../../interfaces/Product";
import Company from "../../interfaces/Company";
import { getDocuments, getDocument, addDocument, deleteDocument, updateDocument } from '../../utils/Database';

const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

const Admin = () => {

  const { user } = useAuth();
  const router = useRouter();
  console.log(user)

  const [form, setForm] = useState<Product>({ 
    id: '',
    name: '', 
    price: 0, 
    description: '', 
    soldTimes: 0,
    images: [''], 
    active: true 
  });
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [company, setCompany] = useState<Company>({
    id: "Cargando...",
    name: "Cargando...",
    description: "Cargando...",
    logoURL: "Cargando...",
    bannerURL: "Cargando...",
    location: "Cargando...",
    locationMaps: "Cargando...",
    paymentAccount: "Cargando...",
    isOpen: false,
    availabilityToday: false,
    openHour: Timestamp.now(),
    closeHour: Timestamp.now(),
  });

  useEffect(() => {
    if (!user || user.uid === "YqW2PcocBXgMxa2bbf34NcLZrbO2") {
      router.push("/");
      return;
    }

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
  }, [user, router]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    const savedCompany = localStorage.getItem('company');
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('company', JSON.stringify(company));
  }, [products, company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (validTypes.includes(file.type) && file.size <= 2 * 1024 * 1024) { // 2MB
        setImageFile(file);
        setError('');
      } else {
        setError('El archivo debe ser JPG, JPEG, PNG o WEBP y no puede pesar más de 2MB.');
      }
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (validTypes.includes(file.type) && file.size <= 2 * 1024 * 1024) { // 2MB
        setLogoFile(file);
        setError('');
      } else {
        setError('El archivo debe ser JPG, JPEG, PNG o WEBP y no puede pesar más de 2MB.');
      }
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (validTypes.includes(file.type) && file.size <= 2 * 1024 * 1024) { // 2MB
        setBannerFile(file);
        setError('');
      } else {
        setError('El archivo debe ser JPG, JPEG, PNG o WEBP y no puede pesar más de 2MB.');
      }
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProduct = {
          ...form,
          id: Date.now().toString(),
          images: [reader.result as string],
        };
        if (editing) {
          setProducts(products.map(product => (product.id === form.id ? newProduct : product)));
        } else {
          setProducts([...products, newProduct]);
        }
        resetForm();
      };
      reader.readAsDataURL(imageFile);
    } else {
      setError('Por favor, selecciona una imagen.');
    }
  };

  const resetForm = () => {
    setForm({ id: '', name: '', price: 0, soldTimes: 0, description: '', images: [''], active: true });
    setEditing(false);
    setImageFile(null);
    setLogoFile(null);
    setBannerFile(null);
    setError('');
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditing(true);
    setImageFile(null); // Reset image file on edit
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const toggleActive = (id: string) => {
    setProducts(products.map(product => (product.id === id ? { ...product, active: !product.active } : product)));
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar lógica adicional si es necesario
    localStorage.setItem('company', JSON.stringify(company));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Administrar Productos y Empresa</h1>

      {/* Formulario para la información de la empresa */}
      <form onSubmit={handleCompanySubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Información de la Empresa</h2>
        <input
                  type="text"
          name="name"
          value={company.name}
          onChange={handleCompanyChange}
          placeholder="Nombre de la Empresa"
          required
          className="border p-2 w-full mb-4"
        />
        <textarea
          name="description"
          value={company.description}
          onChange={handleCompanyChange}
          placeholder="Descripción"
          required
          className="border p-2 w-full mb-4"
        />
        <input
          type="text"
          name="location"
          value={company.location}
          onChange={handleCompanyChange}
          placeholder="Ubicación"
          required
          className="border p-2 w-full mb-4"
        />
        <input
          type="text"
          name="locationMaps"
          value={company.locationMaps}
          onChange={handleCompanyChange}
          placeholder="URL de Google Maps"
          required
          className="border p-2 w-full mb-4"
        />
        
        {/* Previsualización del logo */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Logo de la Empresa</h3>
          <img src={logoFile ? URL.createObjectURL(logoFile) : company.logoURL} alt="Logo" className="w-32 h-32 object-cover rounded-lg mb-2" />
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleLogoChange}
            className="border p-2 w-full mb-2"
          />
        </div>

        {/* Previsualización del banner */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Banner de la Empresa</h3>
          <img src={bannerFile ? URL.createObjectURL(bannerFile) : company.bannerURL} alt="Banner" className="w-full h-32 object-cover rounded-lg mb-2" />
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleBannerChange}
            className="border p-2 w-full mb-2"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Actualizar Información de la Empresa
        </button>
      </form>

      {/* Formulario para administrar productos */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">{editing ? 'Editar Producto' : 'Agregar Producto'}</h2>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre del Producto"
          required
          className="border p-2 w-full mb-4"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Precio"
          required
          className="border p-2 w-full mb-4"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          required
          className="border p-2 w-full mb-4"
        />
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          className="border p-2 w-full mb-4"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          {editing ? 'Actualizar Producto' : 'Agregar Producto'}
        </button>
        <button type="button" onClick={resetForm} className="bg-gray-300 text-black px-4 py-2 rounded-lg ml-2">
          Cancelar
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Lista de Productos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className={`bg-white p-4 rounded-lg shadow-lg ${product.active ? '' : 'opacity-50'}`}>
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p>Precio: €{product.price}</p>
            <p>{product.description}</p>
            <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-2" />
            <button onClick={() => handleEdit(product)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2">
              Editar
            </button>
            <button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2">
              Eliminar
            </button>
            <button onClick={() => toggleActive(product.id)} className={`px-4 py-2 rounded-lg ${product.active ? 'bg-gray-500' : 'bg-green-500'} text-white`}>
              {product.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const AdminPage = () => {
  return (
    <AuthProvider>
      <Admin/>
    </AuthProvider>
  );
}

export default AdminPage;