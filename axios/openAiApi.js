import axios from "axios";
import { openAiApiKey } from "../constant";

const instance = axios.create({
  baseURL: `http://localhost:3000/api/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiApiKey}`,
  },
});

export default instance;
