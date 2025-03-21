"use client";
import { useState, useEffect, useRef  } from "react";
import { Timestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { AuthProvider } from "../../contexts/AuthContext";
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation";
import Image from "next/image"
import Product from "../../interfaces/Product";
import Company from "../../interfaces/Company";
import { getDocuments, getDocument, addDocument, deleteDocument, updateDocument, categories } from "../../utils/Database";

const Admin = () => {

  const { user } = useAuth();
  const router = useRouter();
  
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Product>({ 
    id: "",
    name: "", 
    price: 0, 
    description: "", 
    category: "",
    soldTimes: 0,
    imageURL: "", 
    active: true 
  });
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(form.imageURL || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<Company>({
    id: "Cargando...",
    name: "Cargando...",
    description: "Cargando...",
    phone: "Cargando...",
    logoURL: "https://i.imgur.com/fJwVCpH.png",
    location: "Cargando...",
    locationMaps: "Cargando...",
    paymentAccount: "Cargando...",
    instagram: "Cargando...",
    whatsapp: "Cargando...",
    isOpen: false,
    availabilityToday: false,
    openHour: Timestamp.now(),
    closeHour: Timestamp.now(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().startsWith(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  const [currentPageProduct, setCurrentPageProduct] = useState(0);
  const totalPagesProduct = Math.ceil(filteredProducts.length / 3);
  const visibleProducts = filteredProducts.slice(currentPageProduct * 3, currentPageProduct * 3 + 3);

  if (!user || user.uid !== "YqW2PcocBXgMxa2bbf34NcLZrbO2") {
    router.push("/");
    return;
  }

  const fetchData = async () => {
    try {
      const initialProducts = await getDocuments("products") as Product[];
      const initialCompany = await getDocument("company", user.uid) as Company;
      console.log(user.uid, initialCompany, initialProducts)
      setProducts(initialProducts);
      setCompany(initialCompany);
    } catch (err) {
      console.error(err)
      setError("Error al cargar los datos.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (validTypes.includes(file.type) && file.size <= 2 * 1024 * 1024) {
        setImageFile(file);
        setError("");
      } else {
        setError("El archivo debe ser JPG, JPEG, PNG o WEBP y no puede pesar más de 2MB.");
      }
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newProduct = {
          ...form,
          imageURL: reader.result as string,
        };
        if (editing) {
          await updateDocument("products", newProduct.id, newProduct)
          await fetchData()
          setEditing(false)
          setImageFile(null);
        } else {
          await addDocument("products", newProduct)
          await fetchData()
          setImageFile(null);
        }
        resetForm();
      };
      reader.readAsDataURL(imageFile);
    } else {
        if (editing) {
          await updateDocument("products", form.id, { ...form })
          await fetchData()
          setEditing(false)
          setImageFile(null);
          resetForm();
        } else {
          setError("Sube una imagen.")
        }
    }
  };

  const resetForm = () => {
    setForm({ id: "", name: "", price: 0, soldTimes: 0, category: "", description: "", imageURL: "", active: true });
    setEditing(false);
    setImageFile(null);
    setPreviewImage("")
    setError("");
    fetchData()
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditing(true);
    setImageFile(null);
    setPreviewImage(product.imageURL)
  };

  const handleDelete = async (product: Product) => {
    await deleteDocument("products", product.id)
    await fetchData()
  };

  const toggleActive = async (productObj: Product) => {
    await updateDocument("products", productObj.id, { active: !productObj.active})
    setProducts(products.map(product => (product.id === productObj.id ? { ...product, active: !product.active } : product)));
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;
    await updateDocument("company", user.uid, company)
    await updateProfile(user, {
      displayName: company.name,
      photoURL: company.logoURL
    })
  };

  return (
    <div className="bg-gray-50 min-h-screen sm:p-8 max-w-4xl mx-auto shadow rounded my-12">
      {/* Formulario para la información de la empresa */}
      <form onSubmit={handleCompanySubmit} className="bg-white shadow-lg rounded-lg p-6 w-full mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Editar Perfil de Empresa</h2>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Información General */}
        <div className="flex flex-col gap-4 w-full">
          <label className="text-sm font-semibold text-gray-700">Nombre de la Empresa</label>
          <input
            type="text"
            name="name"
            value={company.name}
            onChange={handleCompanyChange}
            placeholder="Nombre de la Empresa"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
          />

          <label className="text-sm font-semibold text-gray-700">Número de Teléfono</label>
          <input
            type="text"
            name="name"
            value={company.phone}
            onChange={handleCompanyChange}
            placeholder="Número de Teléfono"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
          />
          
          <label className="text-sm font-semibold text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={company.description}
            onChange={handleCompanyChange}
            placeholder="Descripción"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full min-h-[100px]"
          />
        </div>

        {/* Logo de la empresa */}
        <div className="w-full flex items-center justify-center">
          <div
            className="w-64 sm:h-64 rounded-full border-4 border-gray-200 bg-white overflow-hidden cursor-pointer relative shadow-md"
            onClick={() => logoInputRef.current?.click()}
          >
            <Image 
              src={company.logoURL} 
              alt="Logo" 
              width={256}
              height={256}
              className="rounded-full object-cover" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center opacity-0 hover:bg-opacity-100 hover:opacity-50 transition-all duration-300 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-white" width="50" height="50" viewBox="0 0 24 24" fill="white">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="file"
              ref={logoInputRef}
              className="hidden"
              accept="image/*"
              onChange={(event) => {
                if (event.target.files?.[0]) {
                  const file = event.target.files[0];
                  setCompany({ ...company, logoURL: URL.createObjectURL(file) });
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Links de Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">Dirección</label>
          <input
            type="text"
            name="location"
            value={company.location}
            onChange={handleCompanyChange}
            placeholder="Dirección"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Google Maps</label>
          <input
            type="text"
            name="locationMaps"
            value={company.locationMaps}
            onChange={handleCompanyChange}
            placeholder="URL de Google Maps"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
          />
        </div>
      </div>
      
      {/* Redes Sociales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">WhatsApp</label>
          <input
            type="text"
            name="whatsapp"
            value={company.whatsapp}
            onChange={handleCompanyChange}
            placeholder="Número de WhatsApp"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Instagram</label>
          <input
            type="text"
            name="instagram"
            value={company.instagram}
            onChange={handleCompanyChange}
            placeholder="URL de Instagram"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
          />
        </div>
      </div>

      <button type="submit" className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition-all cursor-pointer">
        Actualizar Información
      </button>
    </form>

      {/* Formulario para administrar productos */}
    <form onSubmit={handleSubmitProduct} className="bg-white p-6 rounded-lg mb-6 w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{editing ? "Editar Producto" : "Agregar Producto"}</h2>
      
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-gray-700">Nombre del Producto</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre del Producto"
          required
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
        />
        
        <label className="text-sm font-semibold text-gray-700">Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          required
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Precio</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Precio"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Categoría</label>
            <select 
              name="category" 
              value={form.category} 
              onChange={(e) => setForm({...form, category: e.target.value})} 
              required 
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 w-full"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category, index) => (
                <option key={index} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center mt-4">
      <label className="text-sm font-semibold text-gray-700 mb-2">Suba una imagen:</label>
        <div
          className="w-[230px] h-48 rounded-lg border-4 border-gray-300 bg-white overflow-hidden cursor-pointer relative"
          onClick={() => imageInputRef.current?.click()}
        >
          {previewImage ? (
            <Image src={previewImage} alt="Producto" width={230} height={192} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              Selecciona una imagen
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center opacity-0 hover:bg-opacity-50 hover:opacity-100 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-white" width="50" height="50" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 5l0 14" />
              <path d="M5 12l14 0" />
            </svg>
          </div>
        </div>
        
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          ref={imageInputRef}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              const file = event.target.files[0];
              if (file) {
                setPreviewImage(URL.createObjectURL(file));
                handleFileChange(event);
              }
            }
          }}
        />
      </div>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 mx-auto">
        <button type="submit" className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition-all cursor-pointer">
          {editing ? "Actualizar Producto" : "Agregar Producto"}
        </button>
        <button type="button" onClick={resetForm} className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg shadow-md transition-all cursor-pointer">
          Cancelar
        </button>
      </div>
    </form>

      <h2 className="text-2xl font-semibold px-6 mb-4">Lista de Productos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 w-full md:gap-4 px-6">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPageProduct(0);
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full"
        />

        {/* Filtro por categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setCurrentPageProduct(0);
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category, index) => (
            <option key={index} value={category.value}>{category.label}</option>
          ))}
        </select>
      </div>
      {visibleProducts.length === 0 ? 
      (
        <div className="p-4 rounded-lg bg-gray-100 text-gray-600 text-center w-full">
          No hay productos disponibles que coincidan con los filtros aplicados.
        </div>
      ) 
      :
      (
        <div>
          {products.length > 3 && (
            <div className="flex justify-center items-center mt-4 gap-4">
              <button
                onClick={() => setCurrentPageProduct((prev) => Math.max(prev - 1, 0))}
                disabled={currentPageProduct === 0}
                className={`px-4 py-2 rounded ${currentPageProduct === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"} transition`}
              >
                <span className="md:hidden">←</span>
                <span className="hidden md:inline">Anterior</span>
              </button>
              <span className="text-black font-medium">
                Página {currentPageProduct + 1} de {totalPagesProduct}
              </span>
              <button
                onClick={() => setCurrentPageProduct((prev) => Math.min(prev + 1, totalPagesProduct - 1))}
                disabled={currentPageProduct === totalPagesProduct - 1}
                className={`px-4 py-2 rounded ${currentPageProduct === totalPagesProduct - 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"} transition`}
              >
                <span className="hidden md:inline">Siguiente</span>
                <span className="md:hidden">→</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-h-[435px]">
            {visibleProducts.map((product, index) => (
              <div key={index} className={`bg-white p-4 rounded-lg shadow-2xl flex flex-col h-full`}>
                <img src={product.imageURL} alt={product.name} className="w-[230px] h-48 mx-auto object-cover rounded-lg mb-2" />
                <label className="text-lg font-bold">{product.name}</label>
                <div className="inline-flex justify-between items-center w-full mb-3">
                  <label className="text-sm font-semibold text-black-900">{categories.find((category) => category.value === product.category)?.label}</label>
                  <label className="text-sm font-semibold text-green-700">€{product.price}</label>
                </div>
                <p className="text-sm flex-grow">{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-4">
                  <button onClick={() => toggleActive(product)} className={`${product.active ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"} border-none flex justify-center px-2 py-1 text-white text-xs leading-4 font-bold cursor-pointer text-center uppercase align-middle items-center rounded-lg select-none shadow-md transition duration-200`}>
                    <label className="text-[10px] cursor-pointer">{product.active ? "Desactivar" : "Activar"}</label>
                  </button>              
                  <button onClick={() => handleEdit(product)} className="border-none flex px-2 py-1 bg-yellow-500 text-white text-xs leading-4 font-bold cursor-pointer justify-center text-center uppercase align-middle items-center rounded-lg select-none shadow-md hover:bg-yellow-600 transition duration-200">
                    <label className="text-[10px] cursor-pointer">Editar</label>
                  </button>
                  <button onClick={() => handleDelete(product)} className="border-none flex px-2 py-1 bg-red-500 text-white text-xs leading-4 font-bold cursor-pointer justify-center text-center uppercase align-middle items-center rounded-lg select-none shadow-md hover:bg-red-600 transition duration-200">
                    <label className="text-[10px] cursor-pointer">Eliminar</label>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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