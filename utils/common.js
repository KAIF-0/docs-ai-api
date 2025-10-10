export const extractUrlKey = (url) => {
  const urlObj = new URL(url);
  return urlObj.hostname.split(".")[0] === "www" ||
         urlObj.hostname.split(".")[0] === "docs"
    ? urlObj.hostname.split(".")[1]
    : urlObj.hostname.split(".")[0];
};

export const calculateSubscriptionEndDate = (subscriptionType) => {
  const startDate = new Date();
  const endDate = new Date();
  
  if (subscriptionType === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  return { startDate, endDate };
};

export const getExpiryTime = (subscriptionType) => {
  return subscriptionType === "monthly" 
    ? 30 * 24 * 60 * 60 
    : 365 * 24 * 60 * 60;
};