"use client";
import React, { useState, useEffect, useRef } from "react";
import { getDocuments, updateDocument, deleteDocument, addDocument, categories, formatDateTime, formatDate } from "../../utils/Utils";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Company from "../../interfaces/Company"
import Product from "../../interfaces/Product";
import Category from "../../interfaces/Category";
import Sale from "../../interfaces/Sale"
import Image from "next/image";
import { useCompany } from "../../contexts/CompanyContext"

interface ProductModalProps {
  product: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
  categories: Category[];
}

interface SaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
  formatDateTime: (timestamp: Timestamp) => string;
  getTotalAmount: (sale: Sale) => number;
}

// Sidebar component
const Sidebar = ({ 
  activeSection, 
  setActiveSection,
  isOpen,
  setIsOpen
}: { 
  activeSection: string; 
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { company } = useCompany()

  // Classes for the mobile overlay sidebar
  const mobileClasses = `
    fixed inset-0 z-30 bg-gray-800 text-white w-64 py-6 flex flex-col h-screen
    transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    transition-transform duration-300 ease-in-out sm:hidden
  `;
  
  // Classes for the regular desktop sidebar
  const desktopClasses = `
    bg-gray-800 text-white w-64 py-6 hidden sm:flex flex-col h-screen
  `;

  const renderSidebarContent = () => (
    <>
      <div className="px-6 mb-4 inline-flex gap-2 items-center">
        {company && (
          <Image
            src={company.logoURL}
            alt={company.name}
            className="w-12 h-12"
            width={48}
            height={48}
          />
        )}
        <h1 className="text-2xl font-bold">Panel Admin</h1>
      </div>
      <nav className="flex-1">
        <ul className="px-4">
          <li className={`mb-2 rounded ${activeSection === "empresa" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
            <button 
              onClick={() => {
                setActiveSection("empresa");
                if (window.innerWidth < 640) setIsOpen(false);
              }} 
              className="block px-4 py-2 w-full text-left cursor-pointer"
            >
              Información de Empresa
            </button>
          </li>
          <li className={`mb-2 rounded ${activeSection === "productos" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
            <button 
              onClick={() => {
                setActiveSection("productos");
                if (window.innerWidth < 640) setIsOpen(false);
              }} 
              className="block px-4 py-2 w-full text-left cursor-pointer"
            >
              Gestión de Productos
            </button>
          </li>
          <li className={`mb-2 rounded ${activeSection === "ventas" ? "bg-blue-600" : "hover:bg-gray-700"}`}>
            <button 
              onClick={() => {
                setActiveSection("ventas");
                if (window.innerWidth < 640) setIsOpen(false);
              }} 
              className="block px-4 py-2 w-full text-left cursor-pointer"
            >
              Registro de Ventas
            </button>
          </li>
        </ul>
      </nav>
      <div className="px-4 mt-auto">
        <button 
          className="block px-4 py-2 text-center bg-green-600 rounded hover:bg-green-700 cursor-pointer"
          onClick={()=> window.location.assign("/")}
        >
          Ir a la Tienda
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar (overlay) */}
      <div className={mobileClasses}>
        {renderSidebarContent()}
      </div>
      
      {/* Desktop Sidebar */}
      <div className={desktopClasses}>
        {renderSidebarContent()}
      </div>
      
      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Mobile Navbar component
const MobileNavbar = ({ 
  isOpen, 
  setIsOpen,
  company
}: { 
  isOpen: boolean; 
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  company: Company | null;
}) => {
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center sm:hidden">
      <div className="flex items-center gap-2">
        {company && (
          <Image
            src={company.logoURL}
            alt={company.name}
            className="w-8 h-8 rounded-full"
            width={32}
            height={32}
          />
        )}
        <h1 className="text-xl font-bold">Panel Admin</h1>
      </div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-white focus:outline-none cursor-pointer"
      >
        <div className="w-6 h-0.5 bg-white mb-1.5"></div>
        <div className="w-6 h-0.5 bg-white mb-1.5"></div>
        <div className="w-6 h-0.5 bg-white"></div>
      </button>
    </div>
  );
};

// Panel principal
const AdminPanel = () => {
  const { user, loadingAuth } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("empresa");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { company, loading } = useCompany()

  useEffect(() => {
    if (loadingAuth) return; 
    if (!user) {
      router.push("/login");
    }
  }, [user, loadingAuth, router]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading || !user || loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "empresa":
        return <CompanyInfo setActiveSection={setActiveSection} />;
      case "productos":
        return <ProductsManagement setActiveSection={setActiveSection} />;
      case "ventas":
        return <SalesManagement setActiveSection={setActiveSection} />;
      default:
        return <CompanyInfo setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <MobileNavbar isOpen={isOpen} setIsOpen={setIsOpen} company={company} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        <div className="flex-1 p-8 bg-gray-100 overflow-auto h-screen">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

// Componente para gestionar la información de la empresa
const CompanyInfo = ({ setActiveSection }: { setActiveSection: React.Dispatch<React.SetStateAction<string>> }) => {
  const { company } = useCompany()
  const [companyData, setCompanyData] = useState<Company>({
    name: "Cargando...",
    description: "Cargando...",
    phone: "Cargando...",
    logoURL: "Cargando...",
    weekdaySchedule: "Cargando...",
    weekendSchedule: "Cargando...",
    instagram: "Cargando...",
    location: "Cargando...",
    locationMaps: "Cargando...",
    isOpen: true
  })
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (company) {
      setPreviewImage(company.logoURL);
      setCompanyData(company as Company);
      setActiveSection("empresa");
      setLoading(false);
    }
  }, [company, setActiveSection]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;

    const file = e.target.files[0];

    if(!file) return;
    
    const validTypes = ["image/webp", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Por favor seleccione un archivo: webp, png, jpeg o jpg");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo debe ser menor a 2MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target?.result as string);
      }
      setLogoFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      setCompanyData({ ...companyData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setCompanyData({ ...companyData, [name]: value });
    }
  };

  const uploadImageToImgur = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 8222f161bcef479'
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen a Imgur');
      }
      
      const data = await response.json();
      return data.data.link;
    } catch (error) {
      console.error('Error al subir imagen a Imgur:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const updatedCompany = { ...companyData };
        if (logoFile) {
          try {
            const imgurUrl = await uploadImageToImgur(logoFile);
            updatedCompany.logoURL = imgurUrl;
            setCompanyData(updatedCompany);
          } catch {
            setMessage({ text: "Error al subir la imagen a Imgur", type: "error" });
            setLoading(false);
            return;
          }
        }
        
        if (companyData.id) {
            await updateDocument("company", companyData.id, updatedCompany);
            setMessage({ text: "Información actualizada correctamente", type: "success" });
        } else {
            const newId = await addDocument("company", updatedCompany);
            setCompanyData({ ...updatedCompany, id: newId });
            setMessage({ text: "Información guardada correctamente", type: "success" });
        }
    } catch (error) {
        console.error("Error al guardar datos:", error);
        setMessage({ text: "Error al guardar los datos", type: "error" });
    } finally {
        setLoading(false);
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Información de la Empresa</h2>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div>
              <label className="block mb-2 font-medium">Nombre de la Empresa</label>
              <input
                type="text"
                name="name"
                value={companyData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={companyData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Instagram</label>
              <input
                type="text"
                name="instagram"
                value={companyData.instagram}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Logo de la Empresa</label>
            <div 
              className="h-32 flex items-center justify-center cursor-pointer mt-12"
              onClick={handleImageClick}
            >
              <div className="w-48 h-48 relative rounded-full border border-gray-300 overflow-hidden flex items-center justify-center hover:bg-gray-50">
                {previewImage ? (
                  <Image 
                    src={previewImage}
                    alt="Logo preview"
                    fill
                    className="object-contain" 
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <span className="text-lg">+</span>
                  </div>
                )}
              </div>
              <div className="ml-4 text-sm text-gray-500">
                <p>Click para actualizar logo</p>
                <p className="text-xs">(webp, png, jpeg, jpg - máx 2MB)</p>
                {logoFile && <p className="text-xs text-green-600">Nueva imagen seleccionada</p>}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="logoFile"
              onChange={handleImageChange}
              accept=".webp,.png,.jpeg,.jpg"
              className="hidden"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Horario Dia de Semana</label>
            <input
              type="text"
              name="weekdaySchedule"
              value={companyData.weekdaySchedule}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Horario Fin de Semana</label>
            <input
              type="text"
              name="weekendSchedule"
              value={companyData.weekendSchedule}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2 font-medium">Descripción</label>
          <textarea
            name="description"
            value={companyData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2 font-medium">Dirección</label>
          <textarea
            name="location"
            value={companyData.location}
            onChange={handleInputChange}
            rows={2}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2 font-medium">Enlace a Google Maps</label>
          <input
            type="text"
            name="locationMaps"
            value={companyData.locationMaps}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mt-6 flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOpen"
              name="isOpen"
              checked={companyData.isOpen}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isOpen">Negocio Abierto</label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            disabled={loading || uploadingImage}
          >
            {loading ? "Guardando..." : 
             uploadingImage ? "Subiendo imagen..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Componente para la gestión de productos
const ProductsManagement = ({ setActiveSection }: { setActiveSection: React.Dispatch<React.SetStateAction<string>> }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpenImage, setIsModalOpenImage] = useState<boolean>(false)
  const [productedSelected, setProductedSelected] = useState<Product | null>(null)
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: "",
    name: "",
    description: "",
    category: "",
    price: 0,
    soldTimes: 0,
    active: true,
    imageURL: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setActiveSection("productos");
    fetchProducts();
  }, [setActiveSection]);
  
  const fetchProducts = async () => {
    try {
      const data = await getDocuments("products") as Product[];
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setMessage({ text: "Error al cargar productos", type: "error" });
      setLoading(false);
    }
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });
  
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      setLoading(true);
      try {
        await deleteDocument("products", id);
        setProducts(products.filter(product => product.id !== id));
        setMessage({ text: "Producto eliminado correctamente", type: "success" });
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        setMessage({ text: "Error al eliminar producto", type: "error" });
      } finally {
        setLoading(false);
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    }
  };
  
  const handleToggleActive = async (product: Product) => {
    try {
      const updatedProduct = { ...product, active: !product.active };
      await updateDocument("products", product.id, { active: updatedProduct.active });
      
      setProducts(products.map(p => 
        p.id === product.id ? updatedProduct : p
      ));
      
      setMessage({ 
        text: `Producto ${updatedProduct.active ? "activado" : "desactivado"} correctamente`, 
        type: "success" 
      });
      
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Error al actualizar estado del producto:", error);
      setMessage({ text: "Error al actualizar el estado del producto", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };
  
  const openProductModal = (product: Product | null = null) => {
    setCurrentProduct(product || {
      id: "",
      name: "",
      description: "",
      category: "",
      price: 0,
      soldTimes: 0,
      active: true,
      imageURL: ""
    });
    setIsModalOpen(true);
  };
  
  const closeProductModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({
      id: "",
      name: "",
      description: "",
      category: "",
      price: 0,
      soldTimes: 0,
      active: true,
      imageURL: ""
    });
  };
  
  const saveProduct = async (productData: Product) => {
    setLoading(true);
    try {
      if (productData.id) {
        // Actualizar producto existente
        await updateDocument("products", productData.id, productData);
        setProducts(products.map(p => 
          p.id === productData.id ? productData : p
        ));
        setMessage({ text: "Producto actualizado correctamente", type: "success" });
      } else {
        // Crear nuevo producto
        const newId = await addDocument("products", productData);
        setProducts([...products, { ...productData, id: newId }]);
        setMessage({ text: "Producto creado correctamente", type: "success" });
      }
      closeProductModal();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setMessage({ text: "Error al guardar el producto", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };
  
  if (loading && products.length === 0) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <button 
          onClick={() => openProductModal()} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          Nuevo Producto
        </button>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.imageURL ? (
                        <Image 
                          onClick={()=> {
                            setProductedSelected(product)
                            setIsModalOpenImage(true);
                          }}
                          src={product.imageURL} 
                          alt={product.name} 
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover rounded cursor-pointer" 
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                          Sin imagen
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {categories.find(c => c.value === product.category)?.label || product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.price}€</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.soldTimes || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openProductModal(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`mr-3 cursor-pointer ${
                          product.active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {product.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <ProductModal
          product={currentProduct}
          onSave={saveProduct}
          onClose={closeProductModal}
          categories={categories}
        />
      )}

      {/*Modal de Imagen Expandida*/}
      {isModalOpenImage && productedSelected && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
          onClick={() => {
            setProductedSelected(null)
            setIsModalOpenImage(false);
          }}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <button 
              className="absolute flex items-center text-lg justify-center top-2 right-2 bg-white cursor-pointer w-8 h-8 rounded-full text-black z-10"
              onClick={(e) => {
                e.stopPropagation();
                setProductedSelected(null)
                setIsModalOpenImage(false);
              }}
            >
              ×
            </button>
            <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
              <Image 
                src={productedSelected.imageURL} 
                alt={productedSelected.name}
                width={800}
                height={600}
                className="max-h-[80vh] w-auto h-auto object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Modal para editar/crear producto
const ProductModal: React.FC<ProductModalProps> = ({ product, onSave, onClose, categories }) => {
  const [productData, setProductData] = useState(product);
  const [previewImage, setPreviewImage] = useState<string>(product.imageURL);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const uploadImageToImgur = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 8222f161bcef479'
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen a Imgur');
      }
      
      const data = await response.json();
      return data.data.link;
    } catch (error) {
      console.error('Error al subir imagen a Imgur:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadingImage(true);

    if (logoFile) {
      try {
        const imgurUrl = await uploadImageToImgur(logoFile);
        productData.imageURL = imgurUrl;
      } catch {
        setUploadingImage(false);
        return;
      }
    }
    onSave(productData);
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
  
    if (type === "checkbox") {
      const checkboxTarget = e.target as HTMLInputElement;
      setProductData((prev) => ({ ...prev, [name]: checkboxTarget.checked }));
    } else if (name === "price") {
      setProductData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
  };

    
  const handleImageClick = () => {
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) return;

    const file = e.target.files[0];

    if(!file) return;
    
    const validTypes = ["image/webp", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Por favor seleccione un archivo: webp, png, jpeg o jpg");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo debe ser menor a 2MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target?.result as string);
      }
      setLogoFile(file);
    };
    reader.readAsDataURL(file);
  };
  
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {product?.id ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div>
                  <label className="block mb-1 font-medium">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={productData?.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Categoría</label>
                  <select
                    name="category"
                    value={productData?.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded cursor-pointer"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={productData?.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Imagen del Producto</label>
                  <div 
                    className="h-32 flex items-center justify-center cursor-pointer mt-12"
                    onClick={handleImageClick}
                  >
                    <div className="w-48 h-48 relative border border-gray-300 overflow-hidden flex items-center justify-center hover:bg-gray-50">
                      {previewImage ? (
                        <Image 
                          src={previewImage} 
                          alt="Logo preview" 
                          className="w-full h-full object-contain"
                          objectFit="cover"
                          layout="fill"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <span className="text-lg">+</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                      <p>Click para actualizar imagen</p>
                      <p className="text-xs">(webp, png, jpeg, jpg - máx 2MB)</p>
                      {logoFile && <p className="text-xs text-green-600">Nueva imagen seleccionada</p>}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="logoFile"
                    onChange={handleImageChange}
                    accept=".webp,.png,.jpeg,.jpg"
                    className="hidden"
                  />
                </div>
                
                {product?.id && (
                  <div>
                    <label className="block mb-1 font-medium">Veces Vendido</label>
                    <input
                      type="number"
                      name="soldTimes"
                      value={productData?.soldTimes || 0}
                      className="w-full p-2 border rounded bg-gray-200"
                      readOnly
                    />
                  </div>
                )}
              
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={productData?.active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="active">Producto Activo</label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium">Descripción</label>
              <textarea
                name="description"
                value={productData?.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border rounded"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="button_submit"
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                {uploadingImage ? "Subiendo imagen..." : (product?.id ? "Actualizar" : "Crear")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente para el registro de ventas
const SalesManagement = ({ setActiveSection }: { setActiveSection: React.Dispatch<React.SetStateAction<string>> }) => {
  const [sales, setSales] = useState<Sale[]>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setActiveSection("ventas");
    fetchSales();
  }, [setActiveSection]);
  
  const fetchSales = async () => {
    try {
      const data = await getDocuments("sales") as Sale[];
      data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setSales(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
  };

  
  const filteredSales = sales ? sales.filter(sale => {
    const ipMatch = sale.ip?.startsWith(searchTerm.toLowerCase());
    const idMatch = sale.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let dateMatch = true;
    if (dateFilter) {
      const saleDate = sale.createdAt.toDate();
      const filterDate = new Date(dateFilter);      
      const saleDateString = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}-${String(saleDate.getDate()).padStart(2, '0')}`;
      const filterDateString = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}-${String(filterDate.getDate() + 1).padStart(2, '0')}`;
      
      dateMatch = saleDateString === filterDateString;
    }
    
    return (ipMatch || idMatch) && dateMatch;
  }) : [];
  
  const viewSaleDetails = (sale: Sale) => {
    setCurrentSale(sale);
    setIsModalOpen(true);
  };
  
  const closeSaleModal = () => {
    setIsModalOpen(false);
    setCurrentSale(null);
  };
  
  const getTotalAmount = (sale: Sale) => {
    return sale.product.reduce((total, item) => total + (item.price * item.amount), 0);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registro de Ventas</h2>
      
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Buscar por IP, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length > 0 ? (
                filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{sale.location}</div>
                      <div className="text-xs text-gray-500">{sale.id}</div>
                      <div className="text-xs text-gray-500">{sale.ip}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {sale.product.length === 1 
                          ? sale.product[0].name 
                          : `${sale.product[0].name} +${sale.product.length - 1} más`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${getTotalAmount(sale).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewSaleDetails(sale)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron ventas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && currentSale && (
        <SaleDetailsModal
          sale={currentSale}
          onClose={closeSaleModal}
          formatDateTime={formatDateTime}
          getTotalAmount={getTotalAmount}
        />
      )}
    </div>
  );
};

// Modal para ver detalles de la venta
const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ sale, onClose, formatDateTime, getTotalAmount }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-90vh">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Detalles de la Venta</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Información de la Venta</h4>
              <p className="text-sm text-gray-700"><strong>IP:</strong> {sale.ip}</p>
              <p className="text-sm text-gray-700"><strong>ID:</strong> {sale.id}</p>
              <p className="text-sm text-gray-700"><strong>Fecha:</strong> {formatDateTime(sale.createdAt)}</p>
              <p className="text-sm text-gray-700"><strong>Ubicación:</strong> {sale.location}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Productos</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sale.product.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.amount}</td>
                        <td className="px-4 py-2 whitespace-nowrap">${(item.price * item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2 text-right font-medium">
                        Total:
                      </td>
                      <td className="px-4 py-2 font-medium">
                        ${getTotalAmount(sale).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;