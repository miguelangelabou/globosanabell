"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { isValidEmail } from "../../utils/Utils";
import { useCompany } from "../../contexts/CompanyContext";
import Image from "next/image"

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { company, loading } = useCompany()

  const { login, user, sendPasswordResetEmail, loadingAuth } = useAuth();
  const router = useRouter();


  
  useEffect(() => {
    if (user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  if (loading && loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Por favor complete todos los campos");
      setIsLoading(false);
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Por favor ingrese un correo electrónico válido");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "Firebase: Error (auth/email-already-in-use).") {
          setError("Ya existe una cuenta asociada a ese correo electrónico.");
        } else if (err.message === "Firebase: Error (auth/invalid-credential).") {
          setError("Correo electrónico o contraseña incorrectos.");
        } else if (err.message === "Firebase: Error (auth/too-many-requests).") {
          setError("Demasiados intentos fallidos. Intente más tarde o restablezca su contraseña.");
        } else {
          setError("Error al iniciar sesión. Por favor intente nuevamente.");
        }
      } else {
        setError("Error desconocido. Por favor intente nuevamente.");
      }
    } finally {    
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !isValidEmail(email)) {
      setError("Por favor ingrese un correo electrónico válido para restablecer su contraseña");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setMessage("Se ha enviado un correo para restablecer su contraseña");
      setError(null);
    } catch {
      setError("Error al enviar el correo de recuperación. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-6 text-center">
          {company && (
            <>
              <Image
               src={company.logoURL} 
               alt="Logo" 
               className="rounded-full w-32 h-32 mx-auto"
               width={128}
               height={128}
               />
              <h1 className="text-2xl font-bold text-gray-800">Administración de {company.name}</h1>
            </>
          )}
          <p className="text-gray-600 mt-2">Ingrese sus credenciales para acceder</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div></div>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-800"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;