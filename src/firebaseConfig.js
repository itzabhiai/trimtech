import { initializeApp } from "firebase/app";
import { getFirestore ,serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

    apiKey: "AIzaSyBUsEwdP7lkBFX5vhKB-cojpgeMv27CUso",
    authDomain: "trimtech-f057a.firebaseapp.com",
    projectId: "trimtech-f057a",
    storageBucket: "trimtech-f057a.appspot.com",
    messagingSenderId: "238375141490",
    appId: "1:238375141490:web:fc77688c4fece08911c2eb",
    measurementId: "G-43VNVTYCQN"
};

const app = initializeApp(firebaseConfig);
const textdb = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const database = getDatabase(app);

auth.settings.appVerificationDisabledForTesting = true;

export { textdb, storage, auth, app, database ,serverTimestamp ,};
export default firebaseConfig;

//chahat tayagi




  // apiKey: "AIzaSyCS3Vw3Nxgbo4alqJljKHiPk1imN0o_0Fs",
  // authDomain: "textphoto-48149.firebaseapp.com",
  // projectId: "textphoto-48149",
  // storageBucket: "textphoto-48149.appspot.com",
  // messagingSenderId: "483201101560",
  // appId: "1:483201101560:web:022987b52930ea15b6950d",



//   import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";
// import { getStorage } from "firebase/storage";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyAt9p3BGKBeNSF26npq2QELA3GIBMToScU",
//   authDomain: "raktdaan-7a169.firebaseapp.com",
//   databaseURL: "https://raktdaan-7a169-default-rtdb.firebaseio.com",
//   projectId: "raktdaan-7a169",
//   storageBucket: "raktdaan-7a169.appspot.com",
//   messagingSenderId: "116685109840",
//   appId: "1:116685109840:web:e1fa668c364e4c53fd6f55"
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const storage = getStorage(app);
// const auth = getAuth(app);

// auth.settings.appVerificationDisabledForTesting = true;

// export { database, storage, auth, app };
// export default firebaseConfig;
