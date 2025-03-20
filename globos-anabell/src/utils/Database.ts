import { db } from "../config/firebaseConfig";
import { Timestamp, collection, getDocs, getDoc, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

export const getDocuments = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
};

export const addDocument = async (collectionName: string, data: any) => {
    delete data.id
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, { ...data, createdAt: Timestamp.now() });
    return docRef.id;
};

export const categories = [
  { value: "14_febrero", label: "14 de Febrero" },
  { value: "21_marzo", label: "21 de Marzo" },
  { value: "21_septiembre", label: "21 de Septiembre" },
  { value: "peluches", label: "Peluches" },
  { value: "flores", label: "Flores" },
  { value: "ramos", label: "Ramos" },
  { value: "globos", label: "Globos" },
  { value: "joyeria", label: "Joyeria" },
  { value: "juguetes", label: "Juguetes" },
  { value: "dulces", label: "Dulces" },
  { value: "arreglos_florales", label: "Arreglos florales" },
  { value: "centros_de_mesa", label: "Centros de mesa" },
  { value: "regalos", label: "Regalos" },
  { value: "detalles", label: "Detalles personalizados" },
  { value: "cumpleaños", label: "Cumpleaños" },
  { value: "bodas", label: "Bodas y eventos" },
  { value: "desayunos", label: "Desayunos sorpresa" },
  { value: "cestas", label: "Cestas regalo" },
  { value: "complementos", label: "Complementos" },
];