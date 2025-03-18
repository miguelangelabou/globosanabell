"use client";
import { useState } from "react";
import { auth } from "../../config/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { isValidEmail } from "../../utils/Validations";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.assign("/");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.assign("/");
      }
    } catch (err: any) {
        if(err.message === "Firebase: Error (auth/email-already-in-use).") {
            setError("Ya existe una cuenta asociada a ese correo electrónico.")
            return;
        } else if(err.message === "Firebase: Error (auth/invalid-credential).") {
            setError("Correo Electrónico o contraseña incorrectos.")
            return;
        }
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if(!email || !isValidEmail(email)) {
        setError("Ingresa el correo electrónico válido.");
        return;
    }

    setError(null);
    setMessage(null);
    try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          await sendPasswordResetEmail(auth, email);
          setMessage("Se ha enviado un enlace para restablecer la contraseña a tu correo.");
        } else {
          setError("No existe una cuenta asociada a este correo.");
        }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
        </h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-2">{message}</p>}
        <form onSubmit={handleAuth} className="flex flex-col">
          <input
            type="email"
            placeholder="Correo Electrónico"
            className="border p-2 mb-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="border p-2 mb-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>
        {!isRegister && (
          <p
            className="text-blue-500 text-sm text-center cursor-pointer mt-4"
            onClick={handleForgotPassword}
          >
            ¿Olvidaste tu contraseña?
          </p>
        )}
        <p className="text-sm text-center">
          {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;