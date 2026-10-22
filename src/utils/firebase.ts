import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
async function testConnection() {
  try {
    // Check connection state or ping if possible, or catch offline errors
    await getDocFromServer(doc(db, '_health_check_', 'ping')).catch(() => {});
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firebase client is offline.');
    }
  }
}
testConnection();

let isAuthInProgress = false;

export async function signInAsGuest(): Promise<FirebaseUser | null> {
  try {
    const result = await signInAnonymously(auth);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: 'invitado@espiquumeyria.lab',
        displayName: 'Científico Invitado',
        photoURL: '',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
    return user;
  } catch (error: any) {
    console.warn('Acceso de invitado:', error?.message || error);
    return null;
  }
}

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (isAuthInProgress) {
    console.info('Operación de autenticación ya en curso, esperando...');
    return auth.currentUser;
  }
  isAuthInProgress = true;

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync user profile to Firestore
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || 'usuario@espiquumeyria.lab',
        displayName: user.displayName || 'Científico',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    return user;
  } catch (error: any) {
    const code = error?.code || '';
    if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
      console.info('Ventana emergente cerrada o cancelada por el usuario.');
      return auth.currentUser;
    }
    if (code === 'auth/popup-blocked') {
      console.warn('Ventana emergente bloqueada por el navegador. Iniciando sesión como Invitado Científico para permitir sincronización sin popups.');
      return await signInAsGuest();
    }
    console.warn('Aviso de autenticación:', error?.message || error);
    return auth.currentUser;
  } finally {
    setTimeout(() => {
      isAuthInProgress = false;
    }, 700);
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function saveReactionToFirestore(userId: string, reaction: { id: string; title: string; equation: string; reagents: string }) {
  const path = `users/${userId}/savedReactions`;
  try {
    const ref = doc(db, path, reaction.id);
    await setDoc(ref, {
      id: reaction.id,
      userId,
      title: reaction.title,
      equation: reaction.equation,
      reagents: reaction.reagents,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchSavedReactions(userId: string) {
  const path = `users/${userId}/savedReactions`;
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
