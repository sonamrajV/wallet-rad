// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const USERS_COLLECTION = 'users';
const SUBMISSIONS_COLLECTION = 'submissions';

// Helper functions for Firebase operations
export const saveUserSubmission = async (evmAddress, solanaAddress, suiAddress, signature) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, evmAddress || solanaAddress);
    await setDoc(userRef, {
      evmAddress: evmAddress || null,
      solanaAddress: solanaAddress || null,
      suiAddress,
      signature,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving user submission:', error);
    return { success: false, error: error.message };
  }
};

export const getUserSubmission = async (address) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, address);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting user submission:', error);
    return { success: false, error: error.message };
  }
};

export const updateSuiAddress = async (address, suiAddress) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, address);
    await updateDoc(userRef, {
      suiAddress,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating Sui address:', error);
    return { success: false, error: error.message };
  }
};

export { db, USERS_COLLECTION, SUBMISSIONS_COLLECTION }; 