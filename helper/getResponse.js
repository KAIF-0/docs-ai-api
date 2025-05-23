import axios from "axios";
import { config } from "dotenv";
config();

export const getResponse = async (query, key, url) => {
  try {
    const res = await axios.post(`${process.env.RAG_SERVER_URL}/getResponse`, {
      query,
      key,
      url,
    });

    const { response } = res.data;
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};
