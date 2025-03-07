"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { getPetProfile, updatePetProfile } from "@/lib/db";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petImage, setPetImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [petTraits, setPetTraits] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      getPetProfile(currentUser.uid).then((data) => {
        if (data) {
          setPetName(data.petName || "");
          setPetType(data.petType || "");
          setPetAge(data.petAge || "");
          setImageUrl(data.imageUrl || "");
          setPetTraits(data.traits || []);
        }
      });
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const loadPetProfile = async (userId: string) => {
    const petDoc = await getDoc(doc(db, "users", userId, "petProfile", "profile"));
    if (petDoc.exists()) {
      const data = petDoc.data();
      setPetName(data.petName);
      setPetType(data.petType);
      setPetAge(data.petAge);
      setImageUrl(data.imageUrl);
      setPetTraits(data.traits || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPetImage(e.target.files[0]);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImageUrl(fileReader.result as string); 
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyzePetImage = async (url: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ imageUrl: url }),
        headers: { "Content-Type": "application/json" },
      });

      const { labels } = await response.json();
      console.log("Detected Labels:", labels);

      // Setting the first detected label as the pet type
      if (labels.length > 0) {
        setPetType(labels[0]);
      }

      setAnalyzing(false);
      return labels;
    } catch (error) {
      console.error("Image analysis failed:", error);
      setAnalyzing(false);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let downloadURL = imageUrl;
    let detectedTraits: string[] = [];
    if (petImage) {
      const imageRef = ref(storage, `pets/${user.uid}/${petImage.name}`);
      await uploadBytes(imageRef, petImage);
      downloadURL = await getDownloadURL(imageRef);
      detectedTraits = await analyzePetImage(downloadURL);
    }

    setPetTraits(detectedTraits);
    const updatedTraits = detectedTraits.length > 0 ? detectedTraits : petTraits;

    const petProfile = {
      petName,
      petType: updatedTraits.length > 0 ? updatedTraits[0] : petType,
      petAge,
      imageUrl: downloadURL || "",
      traits: updatedTraits,
    };

    await updatePetProfile(user.uid, petProfile);
    setPetTraits(updatedTraits);
    setEditing(false);
    alert("Profile updated!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-pink-200 to-yellow-200 p-4"> 
      <Navbar />
      <h1 className="mt-24 text-2xl font-semibold mb-4">Pet Profile</h1> 
      
      {/* Image Upload */}
      <div 
        className="relative w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-lg"
        onClick={() => fileInputRef.current?.click()}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Pet" className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-4xl text-gray-500">+</span>
            <span className="text-sm text-gray-600">Upload Image</span>
          </div>
        )}
      </div>

      {/* Hide File Upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {editing ? (
        // EDIT MODE: Show Form to Edit Profile Details
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-80">
          <label className="text-gray-700 font-semibold">Pet Name</label>
          <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} required className="border p-2 rounded-md" />

          <label className="text-gray-700 font-semibold">Pet Type</label>
          <input type="text" value={petType} onChange={(e) => setPetType(e.target.value)} required className="border p-2 rounded-md" />

          <label className="text-gray-700 font-semibold">Pet Age</label>
          <input type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} required className="border p-2 rounded-md" />

          <div className="flex justify-center gap-4 mt-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      ) : (
        // VIEW MODE: Show Pet Profile Details
        <div className="flex flex-col mt-6 bg-white p-4 rounded-lg shadow-lg w-80">
          <p><strong>Pet Name:</strong> {petName}</p>
          <p><strong>Pet Type:</strong> {petType ? petType.charAt(0).toUpperCase() + petType.slice(1) : ""}</p>
          <p><strong>Pet Age:</strong> {petAge} years old</p>

          <button onClick={() => setEditing(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
            Edit Profile
          </button>
        </div>
      )}

      {/* Pet Traits Div*/}
      {petTraits.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-semibold">Detected Traits:</h3>
          <ul className="relative bg-white p-4 rounded-md shadow-lg w-full">
            {petTraits.map((trait, index) => (
              <li
                key={index}
                className="relative text-gray-800 text-lg pl-6 list-none border-b border-blue-300 last:border-none py-2 before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2"
                style={{
                  paddingLeft: "1rem",
                  fontFamily: "cursive",
                }}>
                {trait}
              </li>            
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
