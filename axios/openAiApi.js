import axios from "axios";
import { openAiApiKey } from "../constant";
import { baseUrlStaging } from "./baseUrl";

const instance = axios.create({
  baseURL: `${baseUrlStaging}/api/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiApiKey}`,
  },
});

export default instance;
