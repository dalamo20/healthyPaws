import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, addDoc } from "firebase/firestore";

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
