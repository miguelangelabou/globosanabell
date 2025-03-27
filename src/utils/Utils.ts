import { db } from "../config/firebaseConfig";
import { Timestamp, collection, getDocs, getDoc, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import Product from "../interfaces/Product";
import Company from "../interfaces/Company";
import Sale from "../interfaces/Sale";

export const getDocuments = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateDocument = async (collectionName: string, docId: string, data: object) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
};

export const addDocument = async (collectionName: string, data: (Company | Product | Sale)) => {
    delete data.id
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, { ...data, createdAt: Timestamp.now() });
    return docRef.id;
};

export const categories = [
    { value: "14_febrero", label: "14 de Febrero" },
    { value: "flores_amarillas", label: "Flores Amarillas" },
    { value: "navidad", label: "Navidad" },
    { value: "nacimientos", label: "Nacimientos" },
    { value: "peluches", label: "Peluches" },
    { value: "flores", label: "Flores" },
    { value: "ramos", label: "Ramos" },
    { value: "globos", label: "Globos" },
    { value: "joyeria", label: "Joyeria" },
    { value: "juguetes", label: "Juguetes" },
    { value: "dulces", label: "Dulces" },
    { value: "arreglos", label: "Arreglos" },
    { value: "cumpleaños", label: "Cumpleaños" },
    { value: "bodas", label: "Bodas y eventos" },
    { value: "cestas", label: "Cestas regalo" },
    { value: "complementos", label: "Complementos" },
    { value: "graduaciones", label: "Graduaciones" },
    { value: "promociones", label: "Promociones" }
];
  
export const categoryGroups = {
      "Fechas Especiales": ["14_febrero", "flores_amarillas", "cumpleaños", "bodas", "navidad", "nacimientos", "graduaciones"],
      "Productos Destacados": ["peluches", "flores", "ramos", "globos"],
      "Otros": ["joyeria", "juguetes", "dulces", "arreglos", "cestas", "complementos"]
};
  
export const categoryPriority=()=>{
  const month=new Date().getMonth()+1;
  let categories;
  if(month===1||month===2){
      categories=["promociones", "14_febrero","ramos","arreglos","peluches","joyeria","flores","cumpleaños","complementos"];
  }else if(month>=3&&month<=5){
      categories=["promociones", "flores_amarillas","ramos","arreglos","flores","joyeria","peluches","cumpleaños","complementos"];
  }else if(month>=6&&month<=8){
      categories=["promociones", "cumpleaños","graduaciones","flores","ramos","peluches","globos","juguetes","dulces","joyeria","cestas","complementos"];
  }else if(month>=9&&month<=11){
      categories=["promociones", "flores_amarillas","cumpleaños","dulces","juguetes","arreglos","cestas","complementos"];
  }else{
      categories=["promociones", "navidad","nacimientos","cestas","joyeria","peluches","dulces","flores","complementos"];
  }
  return { categories };
};

export const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const getUserIP = async (): Promise<{ip: string; location: string;}> => {
    try {
        const response = await fetch("https://ipinfo.io/json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return { 
            ip: data.ip, 
            location: `${data.city}, ${data.region}, ${data.country} | ${data.loc}` 
        };
    } catch (error) {
        console.error("Error fetching IP and location:", error);
        throw error;
    }
};

  
export const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
};
  
export const formatDateTime = (timestamp: Timestamp) => {
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