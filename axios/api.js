import axios from "axios";

const instance = axios.create({
  baseURL: `invoice-ai-three.vercel.app/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
