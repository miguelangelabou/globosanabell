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
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, { ...data, createdAt: Timestamp.now() });
    return docRef.id;
};
