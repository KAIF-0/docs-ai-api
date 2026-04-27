import axios from "axios";
import { ENV } from "../config/env.js";

export const getResponse = async (query, key, url, userId) => {
  try {
    const res = await axios.post(`${ENV.RAG_SERVER_URL}/getResponse`, {
      query,
      key,
      url,
      userId,
    });

    const { response } = res.data;
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};