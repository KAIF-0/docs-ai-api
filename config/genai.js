import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env.js";

const genAI = new GoogleGenerativeAI(ENV.GENERATIVE_AI_API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });