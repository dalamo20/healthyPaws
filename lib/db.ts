import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";

//Add User Profile
export const addUser = async (userId: string, email: string) => {
  await setDoc(doc(db, "users", userId), { email });
};

//Get User Profile
export const getUser = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? userDoc.data() : null;
};

//Add Booking
export const addBooking = async (userId: string, bookingData: any) => {
  await addDoc(collection(db, "users", userId, "bookings"), bookingData);
};

// Get All Bookings for Logged-in User
export const getBookings = async (userId: string) => {
  const snapshot = await getDocs(collection(db, "users", userId, "bookings"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Edit Booking (Update Date or Time)
export const updateBooking = async (userId: string, bookingId: string, updatedData: any) => {
  await updateDoc(doc(db, "users", userId, "bookings", bookingId), updatedData);
};

// Delete Booking
export const deleteBooking = async (userId: string, bookingId: string) => {
  await deleteDoc(doc(db, "users", userId, "bookings", bookingId));
};

//Get Pet Profile
export const getPetProfile = async (userId: string) => {
  const petDoc = await getDoc(doc(db, "users", userId, "petProfile", "profile"));
  return petDoc.exists() ? petDoc.data() : null;
};

// Update Pet Profile
export const updatePetProfile = async (userId: string, updatedData: any) => {
  await setDoc(doc(db, "users", userId, "petProfile", "profile"), updatedData, { merge: true });
};

//Delete Pet Profile (Optional)
export const deletePetProfile = async (userId: string) => {
  await deleteDoc(doc(db, "users", userId, "petProfile", "profile"));
};