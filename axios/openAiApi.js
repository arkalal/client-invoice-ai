import axios from "axios";
import { openAiApiKey } from "../constant";

const instance = axios.create({
  baseURL: `https://invoice-ai-three.vercel.app/api/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiApiKey}`,
  },
});

export default instance;
