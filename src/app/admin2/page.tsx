"use client";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { getDocuments, updateDocument, deleteDocument, addDocument, categories } from "../../utils/Database";
import { Timestamp } from "firebase/firestore";
import Company from "../../interfaces/Company"
import Product from "../../interfaces/Product";
import Category from "../../interfaces/Category";
import Sale from "../../interfaces/Sale"

interface CompanyWithFormattedTimes extends Company {
    openHourFormatted?: string;
    closeHourFormatted?: string;
}

interface ProductModalProps {
  product: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
  categories: Category[];
}

interface SaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
  formatDateTime: (date: Date | string) => string;
  getTotalAmount: (sale: Sale) => number;
}

// Componentes de UI
const Sidebar = ({ activeSection }: { activeSection: string }) => {
  return (
    <div className="bg-gray-800 text-white w-64 py-6 flex flex-col h-screen">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold">Panel Admin</h1>
      </div>
      <nav className="flex-1">
        <ul className="px-4">
          <li className="mb-2">
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded ${activeSection === "empresa" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              Información de Empresa
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              to="/productos" 
              className={`block px-4 py-2 rounded ${activeSection === "productos" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              Gestión de Productos
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              to="/ventas" 
              className={`block px-4 py-2 rounded ${activeSection === "ventas" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              Registro de Ventas
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Panel principal
const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState<string>("empresa");

  return (
    <Router>
      <div className="flex">
        <Sidebar activeSection={activeSection} />
        <div className="flex-1 p-8 bg-gray-100 overflow-auto h-screen">
          <Routes>
            <Route path="/admin2" element={<CompanyInfo setActiveSection={setActiveSection} />} />
            <Route path="/productos" element={<ProductsManagement setActiveSection={setActiveSection} />} />
            <Route path="/ventas" element={<SalesManagement setActiveSection={setActiveSection} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Componente para gestionar la información de la empresa
const CompanyInfo = ({ setActiveSection }: { setActiveSection: React.Dispatch<React.SetStateAction<string>> }) => {
  const [company, setCompany] = useState<CompanyWithFormattedTimes>({
    id: "",
    name: "",
    description: "",
    phone: "",
    logoURL: "",
    openHour: Timestamp.now(),
    closeHour: Timestamp.now(),
    whatsapp: "",
    instagram: "",
    location: "",
    locationMaps: "",
    isOpen: false,
    availabilityToday: false,
    paymentAccount: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    setActiveSection("empresa");
    fetchCompanyData();
  }, [setActiveSection]);

  const fetchCompanyData = async () => {
    try {
      const companies = await getDocuments("companies");
      if (companies.length > 0) {
        const companyData = companies[0];
        // Formatear las horas para el input time
        setCompany({
          ...companyData,
          openHourFormatted: companyData.openHour ? formatTimestampForTimeInput(companyData.openHour) : "",
          closeHourFormatted: companyData.closeHour ? formatTimestampForTimeInput(companyData.closeHour) : ""
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos de la empresa:", error);
      setMessage({ text: "Error al cargar datos de la empresa", type: "error" });
      setLoading(false);
    }
  };

  const formatTimestampForTimeInput = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const createTimestampFromTimeString = (timeString: string) => {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return Timestamp.fromDate(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setCompany({ ...company, [name]: checked });
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedData = {
        ...company,
        openHour: company.openHourFormatted ? createTimestampFromTimeString(company.openHourFormatted) : company.openHour,
        closeHour: company.closeHourFormatted ? createTimestampFromTimeString(company.closeHourFormatted) : company.closeHour
      };
      
      // Eliminar las propiedades formateadas
      delete updatedData.openHourFormatted;
      delete updatedData.closeHourFormatted;
      
      if (company.id) {
        await updateDocument("companies", company.id, updatedData);
        setMessage({ text: "Información actualizada correctamente", type: "success" });
      } else {
        const newId = await addDocument("companies", updatedData);
        setCompany({ ...updatedData, id: newId });
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
            <label className="block mb-2 font-medium">Nombre de la Empresa</label>
            <input
              type="text"
              name="name"
              value={company.name}
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
              value={company.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">URL del Logo</label>
            <input
              type="text"
              name="logoURL"
              value={company.logoURL}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">WhatsApp</label>
            <input
              type="text"
              name="whatsapp"
              value={company.whatsapp}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={company.instagram}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Cuenta de Pago</label>
            <input
              type="text"
              name="paymentAccount"
              value={company.paymentAccount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Hora de Apertura</label>
            <input
              type="time"
              name="openHourFormatted"
              value={company.openHourFormatted || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Hora de Cierre</label>
            <input
              type="time"
              name="closeHourFormatted"
              value={company.closeHourFormatted || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2 font-medium">Descripción</label>
          <textarea
            name="description"
            value={company.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2 font-medium">Dirección</label>
          <textarea
            name="location"
            value={company.location}
            onChange={handleInputChange}
            rows="2"
            className="w-full p-2 border rounded"
          ></textarea>
        </div>
        
        <div className="mt-6">
          <label className="block mb-2 font-medium">Enlace a Google Maps</label>
          <input
            type="text"
            name="locationMaps"
            value={company.locationMaps}
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
              checked={company.isOpen}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isOpen">Negocio Abierto</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="availabilityToday"
              name="availabilityToday"
              checked={company.availabilityToday}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="availabilityToday">Disponible Hoy</label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
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
  const [currentProduct, setCurrentProduct] = useState(null);
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
  
  const openProductModal = (product = (null)) => {
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
    setCurrentProduct(null);
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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
              className="w-full p-2 border rounded"
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
                        <img src={product.imageURL} alt={product.name} className="h-12 w-12 object-cover rounded" />
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
                    <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
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
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`mr-3 ${
                          product.active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {product.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
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
        />
      )}
    </div>
  );
};

// Componente Modal para editar/crear producto
const ProductModal: React.FC<ProductModalProps> = ({ product, onSave, onClose, categories }) => {
  const [productData, setProductData] = useState(product);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(productData); // Guardar datos del producto
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
  
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setProductData((prev) => ({ ...prev, [name]: e.target.checked }));
    } else if (name === "price") {
      setProductData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {product.id ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Categoría</label>
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
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
                  value={productData.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">URL de la Imagen</label>
                <input
                  type="text"
                  name="imageURL"
                  value={productData.imageURL}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {product.id && (
                <div>
                  <label className="block mb-1 font-medium">Veces Vendido</label>
                  <input
                    type="number"
                    name="soldTimes"
                    value={productData.soldTimes || 0}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
              )}
              
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={productData.active}
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
                value={productData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border rounded"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {product.id ? "Actualizar" : "Crear"}
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
  const [sales, setSales] = useState<Sale>([]);
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
      // Ordenar por fecha, más recientes primero
      data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setSales(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setLoading(false);
    }
  };
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };
  
  const formatDateTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const filteredSales = sales.filter(sale => {
    const nameMatch = sale.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = sale.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = sale.phone?.includes(searchTerm);
    const dniMatch = sale.DNI?.includes(searchTerm);
    
    let dateMatch = true;
    if (dateFilter) {
      const saleDate = sale.createdAt?.toDate?.() || new Date(sale.createdAt?.seconds * 1000);
      const filterDate = new Date(dateFilter);
      
      dateMatch = saleDate.getFullYear() === filterDate.getFullYear() &&
                  saleDate.getMonth() === filterDate.getMonth() &&
                  saleDate.getDate() === filterDate.getDate();
    }
    
    return (nameMatch || emailMatch || phoneMatch || dniMatch) && dateMatch;
  });
  
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
              placeholder="Buscar por nombre, email, teléfono o DNI..."
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
                      <div className="font-medium">{sale.name}</div>
                      <div className="text-sm text-gray-500">{sale.email}</div>
                      <div className="text-sm text-gray-500">{sale.phone}</div>
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
                        className="text-indigo-600 hover:text-indigo-900"
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
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Información de la Venta</h4>
              <p className="text-sm text-gray-700"><strong>Fecha:</strong> {formatDateTime(sale.createdAt.toDate())}</p>
              <p className="text-sm text-gray-700"><strong>ID:</strong> {sale.id}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Información del Cliente</h4>
              <p className="text-sm text-gray-700"><strong>Nombre:</strong> {sale.name}</p>
              <p className="text-sm text-gray-700"><strong>Email:</strong> {sale.email}</p>
              <p className="text-sm text-gray-700"><strong>Teléfono:</strong> {sale.phone}</p>
              <p className="text-sm text-gray-700"><strong>DNI:</strong> {sale.DNI}</p>
              <p className="text-sm text-gray-700"><strong>Dirección:</strong> {sale.location || "No especificada"}</p>
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
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportación del componente principal
export default AdminPanel;