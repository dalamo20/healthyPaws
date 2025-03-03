import vision from "@google-cloud/vision";
import path from "path";
import { readFileSync } from "fs";

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));

const client = new vision.ImageAnnotatorClient({ credentials });

export const analyzeImage = async (imageUrl: string) => {
  try {
    const [result] = await client.labelDetection(imageUrl);
    return result.labelAnnotations?.map((label) => label.description) || [];
  } catch (error) {
    console.error("Error analyzing image:", error);
    return [];
  }
};