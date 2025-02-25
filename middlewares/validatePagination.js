const { query, validationResult } = require("express-validator");

const validatePagination = (req, res, next) => {
  const { page, limit, search } = req.query;

  // Validar que page y limit sean enteros positivos
  if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
    return res
      .status(400)
      .json({ message: "Invalid value for page. Must be a positive integer." });
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0)) {
    return res.status(400).json({
      message: "Invalid value for limit. Must be a positive integer.",
    });
  }

  // Validar que search sea un string, si existe
  if (search && typeof search !== "string") {
    return res
      .status(400)
      .json({ message: "Invalid value for search. Must be a string." });
  }

  next();
};

module.exports = { validatePagination };
