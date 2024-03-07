import axios from "axios";
import { openAiApiKey } from "../constant";
import { baseUrlStaging, baseUrlTest } from "./baseUrl";

const instance = axios.create({
  baseURL: `${baseUrlTest}/api/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openAiApiKey}`,
  },
});

export default instance;
