"use client";
import { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [petTraits, setPetTraits] = useState<string[]>([]);

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

      if (labels.includes("dog")) setPetType("Dog");
      else if (labels.includes("cat")) setPetType("Cat");
      else if (labels.includes("rabbit")) setPetType("Rabbit");
      else if (labels.includes("turtle")) setPetType("Turtle");
      else setPetType("Unknown");

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

    const petProfile = {
      petName,
      petType,
      petAge,
      imageUrl: downloadURL || "",
      traits: detectedTraits,
    };

    await setDoc(doc(db, "users", user.uid, "petProfile", "profile"), petProfile);
    alert("Profile saved!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-r from-pink-200 to-yellow-200 p-4"> 
      <Navbar />
      <h1 className="text-2xl font-semibold mb-4">Pet Profile</h1>

      {/* Circular Profile Image Upload */}
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

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-80">
        <input type="text" placeholder="Pet Name" value={petName} onChange={(e) => setPetName(e.target.value)} required className="border p-2 rounded-md" />
        <input type="text" placeholder="Pet Type" value={petType} onChange={(e) => setPetType(e.target.value)} required className="border p-2 rounded-md" />
        <input type="number" placeholder="Pet Age" value={petAge} onChange={(e) => setPetAge(e.target.value)} required className="border p-2 rounded-md" />
        
        {analyzing && <p className="text-gray-600">Analyzing image...</p>}

        <button type="submit" className="bg-black text-white p-2 rounded-md">Save Profile</button>
      </form>

      {/* Pet Traits */}
      {petTraits.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-semibold">Detected Traits:</h3>
          <ul className="list-disc pl-4 mt-2">
            {petTraits.map((trait, index) => (
              <li key={index} className="text-gray-700">{trait}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
