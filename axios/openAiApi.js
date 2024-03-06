import axios from "axios";
import { openAiApiKey } from "../constant";

const instance = axios.create({
  baseURL: `invoice-ai-two.vercel.app/api/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiApiKey}`,
  },
});

export default instance;
