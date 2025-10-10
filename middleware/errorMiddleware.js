export const errorHandler = (err, c) => {
  console.error(err.message);
  return c.json(
    {
      success: false,
      message: err.message || "Internal Server Error!",
    },
    500
  );
};

export const notFoundHandler = (c) => {
  console.error(c.get("message"));
  return c.json(
    {
      success: false,
      message: c.get("message") || "Not found!",
    },
    404
  );
};