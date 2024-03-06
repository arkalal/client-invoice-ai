import axios from "axios";

const instance = axios.create({
  baseURL: `invoice-ai-two.vercel.app/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
