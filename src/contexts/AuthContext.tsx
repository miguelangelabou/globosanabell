"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../config/firebaseConfig";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  loadingAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoadingAuth(false);
      
      if (!user && pathname === "/admin") {
        router.push("/login");
      } else if(user && pathname === "/login") {
        router.push("/admin")
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const login = async (username: string, password: string) => {
    try {
      const logged = await signInWithEmailAndPassword(auth, username, password);
      setUser(logged.user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
          throw new Error("Credenciales incorrectas.");
        } else {
          throw new Error(error.message || "Ocurrió un error en el inicio de sesión.");
        }
      } else if (error instanceof Error) {
        throw new Error(error.message || "Ocurrió un error en el inicio de sesión.");
      } else {
        throw new Error("Ocurrió un error desconocido.");
      }
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

  const logout = async () => {
    try {
      await signOut(auth);

      if (pathname === "/admin") {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, logout, sendPasswordResetEmail }}>
      {!loadingAuth && children}
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
