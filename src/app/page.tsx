"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore"
import { useCompany } from '../contexts/CompanyContext';
import { addDocument, getDocuments, categories, categoryGroups, categoryPriority, getUserIP } from "../utils/Utils";
import { MagnifyingGlassIcon, ShoppingCartIcon, HeartIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';
import Product from "../interfaces/Product";
import Sale from "../interfaces/Sale"

const Store = () => {
  
  const router = useRouter()
  const { company, loading } = useCompany()
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 1000});
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  
  const ITEMS_PER_PAGE = 12;
  
  const getCategoryLabel = (value: string) => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const initialProducts = await getDocuments("products") as Product[];
        
        const activeProducts = initialProducts.filter(product => product.active);
        
        setProducts(activeProducts);

        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
        
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
        
        setLoadingData(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const filteredProducts = products.filter(product => {

    if (sortOption === "favorites") {
      return wishlist.includes(product.id);
    }

    const matchesSearch = product.name.toLowerCase().startsWith(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().startsWith(searchTerm.toLocaleLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "popular":
        return b.soldTimes - a.soldTimes;
      case "featured":
      default:
        const indexA = categoryPriority().categories.indexOf(a.category);
        const indexB = categoryPriority().categories.indexOf(b.category);

        if (indexA !== -1 && indexB !== -1) {
          if (indexA !== indexB) {
            return indexA - indexB;
          }
        } 
        else if (indexA !== -1) {
          return -1;
        } else if (indexB !== -1) {
          return 1;
        }
        return b.soldTimes - a.soldTimes;
    }
  });

  const pageCount = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    currentPage * ITEMS_PER_PAGE, 
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    const notification = document.getElementById("notification");
    if (notification) {
      notification.classList.remove("hidden");
      notification.classList.add("block");
      setTimeout(() => {
        notification.classList.add("hidden");
        notification.classList.remove("block");
      }, 2000);
    }
  };
  
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };
  
  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productSelected, setProductedSelected] = useState<Product | null>(null);
  
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  const checkout = async () => {
    if (cart.length === 0) return;

    let orderMessage = "Hola, me gustaría realizar el siguiente pedido:\n\n";

    cart.forEach((item, index) => {
      orderMessage += `${index + 1}. ${item.product.name} (ID: ${item.product.id})\n`;
      orderMessage += `   Cantidad: ${item.quantity}\n`;
      orderMessage += `   Precio unitario: €${item.product.price.toFixed(2)}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    orderMessage += `Total: €${total.toFixed(2)}\n\n`;
    
    orderMessage += "Deseo personalizarle lo siguiente:";
    
    const whatsappURL = `https://wa.me/${company?.phone}?text=${encodeURIComponent(orderMessage)}`;
    
    localStorage.setItem("pendingOrder", JSON.stringify({
      cart: cart,
      timestamp: new Date().toISOString(),
      total: total
    }));
    
    const client = await getUserIP();

    const saleData: Sale = {
      ip: client.ip,
      location: client.location,
      product: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        amount: item.quantity,
      })),
      createdAt: Timestamp.now()
    };

    await addDocument("sales", saleData);
    
    window.open(whatsappURL, '_blank');
    
    setCart([]);
    localStorage.removeItem("cart");
    
    router.push('/thank-you');
  }
  
  if (loading && loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (company?.isOpen ? (
    <div className="min-h-screen">
      {/* Notificación */}
      <div id="notification" className="fixed hidden top-6 right-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50">
        <div className="flex items-center">
          <div className="mr-2">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p>¡Producto añadido al carrito!</p>
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image 
                src={company?.logoURL || ""} 
                alt={company?.name || ""} 
                width={48} 
                height={48} 
                className="h-12 w-12 rounded-full object-cover mr-3" 
              />
              <h1 className="text-2xl font-bold text-pink-600">{company?.name}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Carrito */}
              <button 
                onClick={() => setShowCart(!showCart)} 
                className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors cursor-pointer"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              {/* Botón de filtros móvil */}
              <button 
                className="sm:hidden p-2 text-gray-700 hover:text-pink-600 transition-colors cursor-pointer"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              >
                <AdjustmentsHorizontalIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Búsqueda */}
          <div className="mt-4 relative">
            <div className="flex">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Selector de orden */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="ml-2 py-3 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="favorites">Mis favoritos</option>
                <option value="popular">Más populares</option>
                <option value="price-low-high">Precio: menor a mayor</option>
                <option value="price-high-low">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-12 sm:flex-row">
          {/* Sidebar de filtros (pantallas medianas y grandes) */}
          <div className="hidden sm:block w-64 pr-8 bg-[#fcdef8] p-4 rounded-md self-start">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
            
            {/* Categorías */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Categorías</h3>
              <div>
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(0);
                  }}
                  className={`block mb-2 text-sm cursor-pointer ${selectedCategory === "" ? "font-semibold text-pink-600" : "text-gray-700 hover:text-pink-600"}`}
                >
                  Todas las categorías
                </button>
                
                {Object.entries(categoryGroups).map(([groupName, categoryValues]) => (
                  <div key={groupName} className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{groupName}</h4>
                    <ul>
                      {categoryValues.map(value => (
                        <li key={value}>
                          <button
                            onClick={() => {
                              setSelectedCategory(value);
                              setCurrentPage(0);
                            }}
                            className={`block mb-1 text-sm cursor-pointer ${selectedCategory === value ? "font-semibold text-pink-600" : "text-gray-700 hover:text-pink-600"}`}
                          >
                            {getCategoryLabel(value)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rango de precio */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Precio</h3>
              <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{priceRange.min}€</span>
                  <span className="text-sm text-gray-600">{priceRange.max}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange.max}
                  onChange={(e) => {
                    setPriceRange({...priceRange, max: parseInt(e.target.value)});
                    setCurrentPage(0);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            </div>
          </div>
          
          {/* Filtros móviles (panel deslizante) */}
          <div className={`sm:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transform ${isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
            <div className="relative h-full w-3/4 max-w-xs bg-white overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                  <button 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="text-gray-500 focus:outline-none cursor-pointer"
                  >
                    <svg className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Categorías */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Categorías</h3>
                  <div>
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setCurrentPage(0);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`block mb-2 text-sm cursor-pointer ${selectedCategory === "" ? "font-semibold text-pink-600" : "text-gray-700 hover:text-pink-600"}`}
                    >
                      Todas las categorías
                    </button>
                    
                    {Object.entries(categoryGroups).map(([groupName, categoryValues]) => (
                      <div key={groupName} className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{groupName}</h4>
                        <ul>
                          {categoryValues.map(value => (
                            <li key={value}>
                              <button
                                onClick={() => {
                                  setSelectedCategory(value);
                                  setCurrentPage(0);
                                  setIsMobileFiltersOpen(false);
                                }}
                                className={`block mb-1 text-sm cursor-pointer ${selectedCategory === value ? "font-semibold text-pink-600" : "text-gray-700 hover:text-pink-600"}`}
                              >
                                {getCategoryLabel(value)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rango de precio */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Precio</h3>
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{priceRange.min}€</span>
                      <span className="text-sm text-gray-600">{priceRange.max}€</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange.max}
                      onChange={(e) => {
                        setPriceRange({...priceRange, max: parseInt(e.target.value)});
                        setCurrentPage(0);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1">
            {/* Panel de carrito */}
            <div className={`fixed border-l bg-[#fcdef8] border-gray-400 inset-y-0 right-0 max-w-md w-full shadow-xl overflow-y-auto transform ${showCart ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-50`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Tu carrito</h2>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <svg className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Tu carrito está vacío</h3>
                    <p className="text-gray-500 mb-4">¿Por qué no añades algo bonito?</p>
                    <button 
                      onClick={() => setShowCart(false)}
                      className="inline-flex items-center cursor-pointer justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 divide-gray-200">
                      {cart.map(item => (
                        <div key={item.product.id} className="p-4 flex rounded-md bg-white shadow-md">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <Image 
                              src={item.product.imageURL} 
                              alt={item.product.name} 
                              width={100}
                              height={100}
                              objectFit="cover"
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.product.name}</h3>
                                <p className="ml-4">{item.product.price}€</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{getCategoryLabel(item.product.category)}</p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                              <div className="flex items-center border rounded-md">
                                <button 
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="px-2 py-1 text-gray-600 hover:text-gray-800 cursor-pointer"
                                >-</button>
                                <span className="px-2 py-1 text-gray-800">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="px-2 py-1 text-gray-600 hover:text-gray-800 cursor-pointer"
                                >+</button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.product.id)}
                                className="font-medium text-pink-600 hover:text-pink-500 cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                        <p>Subtotal</p>
                        <p>{cartTotal}€</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Precios de envio y descuentos se obtendran por WhatsApp.</p>
                      <button
                        onClick={checkout}
                        className="w-full flex items-center cursor-pointer justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700"
                      >
                        Finalizar compra por WhatsApp
                      </button>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          o{" "}
                          <button
                            type="button"
                            className="font-medium text-pink-600 hover:text-pink-500 cursor-pointer"
                            onClick={() => setShowCart(false)}
                          >
                            Continuar comprando
                          </button>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Resultados y paginación */}
            <div>
              {selectedCategory && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{getCategoryLabel(selectedCategory)}</h2>
                </div>
              )}
              
              <div className="mb-4 text-sm text-gray-500 inline-flex items-center justify-between w-full">
                {filteredProducts.length} resultados

                {/* Botones de paginación fijos al final */}
                <div className="flex justify-center hidden md:block">
                  <button 
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                      currentPage === 0 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Anterior
                  </button>
                  
                  {currentPage > 0 && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                        currentPage === currentPage - 1
                          ? "bg-pink-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {currentPage}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage)}
                    className="mx-1 px-3 py-2 rounded-md cursor-pointer bg-pink-600 text-white"
                  >
                    {currentPage + 1}
                  </button>
                  
                  {currentPage < pageCount - 1 && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                        currentPage === currentPage + 1
                          ? "bg-pink-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {currentPage + 2}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
                    disabled={currentPage === pageCount - 1}
                    className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                      currentPage === pageCount - 1 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col">
                {/* Contenedor de productos o mensaje */}
                <div className="flex-grow">
                  {displayedProducts.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedProducts.map((product, index) => (
                          <div
                            key={index}
                            className={`${
                              product.category === categoryPriority().categories[0]
                                ? categoryPriority().backgroundColor
                                : "bg-white"
                            } rounded-lg shadow-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col`}
                          >
                            <div className="relative h-40 sm:h-56 overflow-hidden">
                              <Image 
                                onClick={() => {
                                  setProductedSelected(product);
                                  setIsModalOpen(true);
                                }}
                                src={product.imageURL} 
                                alt={product.name} 
                                layout="fill"
                                objectFit="cover"
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute cursor-pointer top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full shadow-sm hover:bg-opacity-100 transition-colors"
                              >
                                <HeartIcon 
                                  className={`h-5 w-5 ${
                                    wishlist.includes(product.id)
                                      ? "text-pink-500 fill-pink-500"
                                      : "text-gray-400"
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="p-2 sm:p-4 flex flex-col">
                              <div className="mb-2">
                                <span className="inline-block px-2 py-1 text-[9px] sm:text-xs font-semibold text-pink-600 bg-pink-100 rounded-full">
                                  {getCategoryLabel(product.category)}
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1">
                                {product.name}
                              </h3>
                              <div className="mt-auto pt-4 flex items-center justify-between">
                                <p className="text-base sm:text-xl font-bold text-gray-900">
                                  {product.price}€
                                </p>
                                <button
                                  onClick={() => addToCart(product)}
                                  className="flex items-center justify-center cursor-pointer px-1.5 sm:px-3 py-1 sm:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                >
                                  <ShoppingCartIcon className="h-3 sm:h-5 w-3 sm:w-5 mr-1" />
                                  <span className="text-xs">Añadir</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex mx-auto justify-center mt-4 block md:hidden">
                        <button 
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                            currentPage === 0 
                              ? "text-gray-400 cursor-not-allowed text-sm" 
                              : "text-gray-700 hover:bg-gray-200 text-sm"
                          }`}
                        >
                          Anterior
                        </button>
                        
                        {currentPage > 0 && (
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className={`mx-1 px-2 py-1 rounded-md cursor-pointer ${
                              currentPage === currentPage - 1
                                ? "bg-pink-600 text-white text-sm"
                                : "text-gray-700 hover:bg-gray-200 text-sm"
                            }`}
                          >
                            {currentPage}
                          </button>
                        )}
                        
                        <button
                          onClick={() => setCurrentPage(currentPage)}
                          className="mx-1 px-2 py-1 text-sm rounded-md cursor-pointer bg-pink-600 text-white"
                        >
                          {currentPage + 1}
                        </button>
                        
                        {currentPage < pageCount - 1 && (
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                              currentPage === currentPage + 1
                                ? "bg-pink-600 text-white text-sm"
                                : "text-gray-700 hover:bg-gray-200 text-sm"
                            }`}
                          >
                            {currentPage + 2}
                          </button>
                        )}
                        
                        <button 
                          onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))}
                          disabled={currentPage === pageCount - 1}
                          className={`mx-1 px-3 py-2 rounded-md cursor-pointer ${
                            currentPage === pageCount - 1 
                              ? "text-gray-400 cursor-not-allowed text-sm" 
                              : "text-gray-700 hover:bg-gray-200 text-sm"
                          }`}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-lg shadow text-center flex items-center justify-center h-full">
                      <div className="flex flex-col items-center">
                        <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          No se encontraron productos
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Intenta con otros filtros o términos de búsqueda
                        </p>
                        <button 
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("");
                            setPriceRange({ min: 0, max: 1000 });
                            setCurrentPage(0);
                            setSortOption("featured");
                          }}
                          className="inline-flex items-center justify-center cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
                  
              {/*Modal de Imagen Expandida*/}
              {isModalOpen && productSelected && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                  onClick={() => {
                    setProductedSelected(null);
                    setIsModalOpen(false);
                  }}
                >
                  <div className="relative p-4 w-full max-w-full lg:max-w-4xl">
                    <button 
                      className="absolute flex items-center justify-center top-2 right-2 bg-white cursor-pointer w-8 h-8 rounded-full text-black z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductedSelected(null);
                        setIsModalOpen(false);
                      }}
                    >
                      ×
                    </button>
                    <div className="relative w-full">
                      {/* Versión para móviles (responsive) */}
                      <div className="block lg:hidden">
                        <Image 
                          src={productSelected.imageURL} 
                          alt={productSelected.name}
                          layout="responsive"
                          width={800}
                          height={600}
                          objectFit="contain"
                        />
                      </div>
                      {/* Versión para pantallas grandes: tamaño fijo */}
                      <div className="hidden lg:block relative w-[800px] h-[600px]">
                        <Image 
                          src={productSelected.imageURL} 
                          alt={productSelected.name}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paginación */}
              {isModalOpen && productSelected && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                  onClick={() => {
                    setProductedSelected(null);
                    setIsModalOpen(false);
                  }}
                >
                  <div className="relative p-4 w-full flex justify-center">
                    <button 
                      className="absolute flex items-center justify-center top-2 right-2 bg-white cursor-pointer w-8 h-8 rounded-full text-black z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductedSelected(null);
                        setIsModalOpen(false);
                      }}
                    >
                      ×
                    </button>

                    <div className="w-full flex justify-center">
                      {/* Móviles: versión responsive */}
                      <div className="block md:hidden w-full max-w-md">
                        <Image 
                          src={productSelected.imageURL} 
                          alt={productSelected.name}
                          layout="responsive"
                          width={800}
                          height={600}
                          objectFit="contain"
                        />
                      </div>

                      {/* Laptops: versión con contenedor fijo (tamaño medio) */}
                      <div className="hidden md:block lg:hidden relative" style={{ width: '600px', height: '450px' }}>
                        <Image 
                          src={productSelected.imageURL} 
                          alt={productSelected.name}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>

                      {/* Computadoras de escritorio: versión con contenedor fijo (tamaño completo) */}
                      <div className="hidden lg:block relative" style={{ width: '800px', height: '600px' }}>
                        <Image 
                          src={productSelected.imageURL} 
                          alt={productSelected.name}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#fcdef8] mt-16 pt-12 pb-8 border-t border-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información de la empresa */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acerca de {company?.name}</h3>
              <p className="text-xs text-gray-600 mb-4">{company?.description}</p>
              <span className="text-sm text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4a.75.75 0 00.22.53l3 3a.75.75 0 101.06-1.06L10.75 10.5V6z" clipRule="evenodd" />
                </svg>
                Lunes a Viernes:<br />{company?.weekdaySchedule}
              </span>
              <br />
              <span className="text-sm text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4a.75.75 0 00.22.53l3 3a.75.75 0 101.06-1.06L10.75 10.5V6z" clipRule="evenodd" />
                </svg>
                Sábado y Domingo:<br />{company?.weekendSchedule}
              </span>
              <a 
                href={company?.locationMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 text-sm mb-2 mt-4 hover:text-pink-600 transition-colors"
              >
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{company?.location}</span>
              </a>
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{company?.phone}</span>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías populares</h3>
              <ul className="space-y-2">
                {Object.values(categoryGroups).flat().slice(0, 6).map(category => (
                  <li key={category}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(0);
                        window.scrollTo({top: 0, behavior: "smooth"});
                      }}
                      className="text-gray-600 hover:text-pink-600 text-sm transition-colors cursor-pointer"
                    >
                      {getCategoryLabel(category)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes sociales y contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto y redes sociales</h3>
              <div className="flex space-x-4 mb-4">
                {company?.instagram && (
                  <a 
                    href={`https://instagram.com/${company?.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}

                {company?.phone && (
                  <a 
                    href={`https://wa.me/${company?.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                )}
              </div>

              <button
                onClick={() => {
                  const whatsappURL = `https://wa.me/${company?.phone}?text=${encodeURIComponent(`Hola ${company?.name}, me gustaría hacer una consulta sobre sus productos.`)}`;
                  window.open(whatsappURL, "_blank");
                }}
                className="inline-flex items-center px-4 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Consultar por WhatsApp
              </button>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11935.15413521237!2d2.4054406!3d41.5954573!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4cb3fc200ac1d%3A0x7be5b0e6918f6dc5!2sGlobos%20Anabell%20Maresme!5e0!3m2!1ses-419!2sus!4v1742652975101!5m2!1ses-419!2sus" 
                width="230" height="230" 
                className="border-none mt-4"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" >
                </iframe>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-400 text-center w-full">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {company?.name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
  :
  (
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
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tienda Cerrada
            </h1>
            
            <p className="text-gray-600 mb-8">
                Lo sentimos, en este momento no estamos abiertos. Por favor, inténtalo más tarde.
            </p>
        </div>
    </div>
  )
  );
};

export default Store;                    