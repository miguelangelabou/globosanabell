"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (!user) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          window.location.assign('/login');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const logged = await signInWithEmailAndPassword(auth, email, password);
      setUser(logged.user);
      router.push("/admin")
    } catch (error) { 
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw new Error("Error al cerrar sesión.");
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      throw new Error("Error al enviar correo de restablecimiento de contraseña.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, sendPasswordResetEmail }}>
      {!loading && user && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider.");
  }
  return context;
};