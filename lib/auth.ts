import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { addUser } from "./db";

export const signUp = async (email: string, password: string) => {
  try {
    console.log("Firebase Auth Instance:", auth);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created in Firebase Auth:", user.uid);

    try {
      await addUser(user.uid, email);
    } catch (dbError: any) {
      console.error("Firestore write error:", dbError.message);
    }

    return user;
  } catch (error: any) {
    console.error("Signup error:", error.message);
    // console.error("Signup error object:", error);

    let errorMessage = "An error occurred. Please try again.";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already in use. Please use a different email.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Your password is too weak. Try a stronger one.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email format. Please enter a valid email.";
    }

    throw new Error(errorMessage);
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
