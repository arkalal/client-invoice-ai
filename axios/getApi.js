import axios from "axios";
import { baseUrlStaging } from "./baseUrl";

const instance = axios.create({
  baseURL: `${baseUrlStaging}/api/`,
  headers: {
    // "Content-Type": "application/json",
    "Content-Type": "multipart/form-data",
  },
});

export default instance;
