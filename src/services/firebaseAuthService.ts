import {
  OAuthProvider,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firebaseAuth } from "../firebase/firebaseConfig";
import { db } from "../firebase/firebaseConfig";

console.log("🔥 firebaseAuthService.ts cargado");
console.log("✓ db importado:", db);
console.log("✓ firebaseAuth importado:", firebaseAuth);

const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.addScope("openid");
microsoftProvider.addScope("profile");
microsoftProvider.addScope("email");

export const signInWithMicrosoft = async () => {
  const result = await signInWithPopup(firebaseAuth, microsoftProvider);
  return result.user;
};

export const signInWithFirebaseEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return result.user;
};

export const getFirebaseIdToken = (user: FirebaseUser) => {
  return user.getIdToken();
};

export const signOutFromFirebase = () => {
  return signOut(firebaseAuth);
};

export const createOrUpdateFirestoreUser = async (
  firebaseUser: FirebaseUser
): Promise<{
  isNewUser: boolean;
  role: string;
}> => {
  try {
    console.log("DB:", db);
    console.log("PROJECT:", db.app.options.projectId);
    console.log("UID:", firebaseUser.uid);

    const userRef = doc(db, "users", firebaseUser.uid);

    console.log("ANTES GETDOC");

    const userSnap = await getDoc(userRef);

    console.log("DESPUES GETDOC");

    if (!userSnap.exists()) {
      console.log("USUARIO NO EXISTE - Crear con rol PENDING");

      console.log("ANTES SETDOC");

      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: "PENDING",
        is_active: true,
      });

      console.log("DESPUES SETDOC");

      return {
        isNewUser: true,
        role: "PENDING",
      };
    }

    const existingRole = userSnap.data()?.role || "STUDENT";
    console.log("USUARIO EXISTE - Role:", existingRole);

    return {
      isNewUser: false,
      role: existingRole,
    };
  } catch (error: any) {
    console.error("FIRESTORE ERROR:", error);
    throw error;
  }
};

export const adminExists = async (): Promise<boolean> => {
  try {
    const adminQuery = query(
      collection(db, "users"),
      where("role", "==", "ADMIN")
    );
    const snapshot = await getDocs(adminQuery);
    return snapshot.size > 0;
  } catch (error: any) {
    console.error("Error checking admin existence:", error);
    throw error;
  }
};

export const saveUserWithRole = async (
  firebaseUser: FirebaseUser,
  role: "STUDENT" | "TEACHER"
): Promise<void> => {
  try {
    // Validate ADMIN doesn't exist if selecting TEACHER
    if (role === "TEACHER") {
      const admin = await adminExists();
      if (admin) {
        throw new Error(
          "Un docente ya existe en el sistema. Solo un admin puede crearse."
        );
      }
    }

    const userRef = doc(db, "users", firebaseUser.uid);
    await setDoc(
      userRef,
      {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        is_active: true,
        provider: "microsoft",
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("User role saved:", role);
  } catch (error: any) {
    console.error("Error saving user role:", error);
    throw error;
  }
};
