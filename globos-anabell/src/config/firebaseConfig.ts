import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdp-gGCnTCkoaQ0LlByX-I_XR-BFcPAN0",
  authDomain: "globosanabell-e2cd9.firebaseapp.com",
  projectId: "globosanabell-e2cd9",
  storageBucket: "globosanabell-e2cd9.firebasestorage.app",
  messagingSenderId: "307408719641",
  appId: "1:307408719641:web:3574d1ff1d01b504e27f88",
  measurementId: "G-877WX483MT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

/*

npm i firebase
npm i firebase/tools
firebase login
firebase init
firebase deploy --only hosting:globosanabell

{
  "hosting": {
    "site": "globosanabell",

    "public": "public",
    ...
  }
}

*/
