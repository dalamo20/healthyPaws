"use client";
import { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petImage, setPetImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      loadPetProfile(currentUser.uid);
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPetImage(e.target.files[0]);
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
      // Autofills if pet type is detected
      // Add more labels for more pet types
      if (labels.includes("dog")) setPetType("Dog");
      else if (labels.includes("cat")) setPetType("Cat");
      else if (labels.includes("rabbit")) setPetType("Rabbit");
      else setPetType("Unknown");

    } catch (error) {
      console.error("Image analysis failed:", error);
    }
    setAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let downloadURL = imageUrl;
    if (petImage) {
      const imageRef = ref(storage, `pets/${user.uid}/${petImage.name}`);
      await uploadBytes(imageRef, petImage);
      downloadURL = await getDownloadURL(imageRef);
      // Analyzes image after upload 
      await analyzePetImage(downloadURL);
    }

    const petProfile = {
      petName,
      petType,
      petAge,
      imageUrl: downloadURL || "",
    };

    await setDoc(doc(db, "users", user.uid, "petProfile", "profile"), petProfile);
    alert("Profile saved!");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-200 to-yellow-200">
      <Navbar />
      <h1 className="text-2xl font-semibold mb-4">Pet Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="Pet Name" value={petName} onChange={(e) => setPetName(e.target.value)} required className="border p-2" />
        <input type="text" placeholder="Pet Type" value={petType} onChange={(e) => setPetType(e.target.value)} required className="border p-2" />
        <input type="number" placeholder="Pet Age" value={petAge} onChange={(e) => setPetAge(e.target.value)} required className="border p-2" />
        <input type="file" onChange={handleFileChange} className="border p-2" />
        {imageUrl && <img src={imageUrl} alt="Pet" className="w-32 h-32 object-cover rounded-lg" />}
        {analyzing && <p className="text-gray-600">Analyzing image...</p>}
        <button type="submit" className="bg-black text-white p-2">Save Profile</button>
      </form>
    </div>
  );
}
