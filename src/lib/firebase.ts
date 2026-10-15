import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Checks whether valid Firebase credentials are provided in the environment (.env)
 */
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your-') &&
  !firebaseConfig.projectId.includes('your-') &&
  firebaseConfig.apiKey !== 'placeholder-api-key'
);

/**
 * Diagnostic tool showing current Firebase environment configuration status
 */
export function getFirebaseConfigStatus(): {
  configured: boolean;
  missing: string[];
  projectId: string;
} {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your-')) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your-')) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('your-')) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket.includes('your-')) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.appId || firebaseConfig.appId.includes('your-')) missing.push('VITE_FIREBASE_APP_ID');

  return {
    configured: isFirebaseConfigured,
    missing,
    projectId: isFirebaseConfigured ? firebaseConfig.projectId : '(Not configured)',
  };
}

// Initialize Firebase singleton
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Safe mock instance placeholder for when credentials are not yet entered
  const dummyApp = getApps().length > 0 ? getApp() : initializeApp({
    apiKey: 'dummy-placeholder-key-for-development',
    projectId: 'salalakart-zone-placeholder',
    appId: '1:1234567890:web:abcdef123456',
  });
  app = dummyApp;
  auth = getAuth(dummyApp);
  db = getFirestore(dummyApp);
  storage = getStorage(dummyApp);
}

export { app, auth, db, storage };

/**
 * Checks if a user has the 'admin' role in the Firestore 'user_roles' collection
 */
export async function checkFirebaseUserIsAdmin(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !userId) return false;
  try {
    const roleDocRef = doc(db, 'user_roles', userId);
    const snap = await getDoc(roleDocRef);
    if (snap.exists() && snap.data()?.role === 'admin') {
      return true;
    }

    // Alternative: check user_roles collection by query where user_id == userId
    const q = query(
      collection(db, 'user_roles'),
      where('user_id', '==', userId),
      where('role', '==', 'admin')
    );
    const querySnap = await getDocs(q);
    return !querySnap.empty;
  } catch (err) {
    console.warn('Error checking Firebase admin role in Firestore:', err);
    return false;
  }
}

/**
 * Upload an image file to Firebase Cloud Storage (folder: 'products' or 'banners')
 * Returns the public Download URL
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folder = 'products'
): Promise<{ url: string | null; error?: string }> {
  if (!isFirebaseConfigured) {
    return { url: URL.createObjectURL(file) };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${cleanFileName}.${fileExt}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { url: downloadUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Firebase image upload failed';
    return { url: null, error: msg };
  }
}

/**
 * Send password reset email using Firebase Auth
 */
export async function sendFirebasePasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Email address is required.' };
  }

  if (!isFirebaseConfigured) {
    return { success: true };
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Firebase password reset failed';
    return { success: false, error: msg };
  }
}
