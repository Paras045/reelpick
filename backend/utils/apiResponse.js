/**
 * Standardized API response helpers.
 */
const success = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

const error = (res, message, statusCode = 500, details = null) => {
  const payload = { success: false, error: message };
  if (details && process.env.NODE_ENV !== 'production') payload.details = details;
  res.status(statusCode).json(payload);
};

module.exports = { success, error };
