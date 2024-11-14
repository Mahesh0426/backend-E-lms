export const buildSuccessResponse = (res, data, message = "") => {
  return res.json({
    status: "success",
    data,
    message,
  });
};

export const buildErrorResponse = (res, message = "") => {
  res.json({
    status: "error",
    message: message || "Something went wrong!",
  });
};
