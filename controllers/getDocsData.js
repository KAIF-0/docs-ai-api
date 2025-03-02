import { chatRedisClient } from "../configs/redis/chatInstance.js";

export const docsData = async (key, url) => {
  let docsData = await chatRedisClient.get(key);
  if (!docsData) {
    // await scrapeDocumentation(key, url);
    await scrapeDocumentation(key, url)
      .then(() => console.log("Documentation Scrapped Successfully!"))
      .catch((err) => console.log(err));
    docsData = await chatRedisClient.get(key);
  }
  //   console.log(docsData);
  return docsData ? JSON.parse(docsData) : [];
};
