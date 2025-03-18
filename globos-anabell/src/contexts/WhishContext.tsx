import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Product from "../interfaces/Product";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchWishlistFromFirebase(currentUser.uid);
      } else {
        loadWishlistFromLocalStorage();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchWishlistFromFirebase = async (uid: string) => {
    const userRef = doc(db, "wishlists", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setWishlist(docSnap.data().items);
    } else {
      setWishlist([]);
    }
  };

  const loadWishlistFromLocalStorage = () => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  };

  const saveWishlistToLocalStorage = (updatedWishlist: Product) => {
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const updateWishlistInFirebase = async (updatedWishlist: Product) => {
    if (user) {
      const userRef = doc(db, "wishlists", user.uid);
      await setDoc(userRef, { items: updatedWishlist });
    }
  };

  const toggleWishlistItem = async (product: Product) => {
    let updatedWishlist;
    if (wishlist.some((item) => item.id === product.id)) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlist, product];
    }
    setWishlist(updatedWishlist);
    user ? updateWishlistInFirebase(updatedWishlist) : saveWishlistToLocalStorage(updatedWishlist);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlistItem }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};
