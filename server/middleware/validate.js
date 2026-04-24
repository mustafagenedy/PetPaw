const { validationResult } = require('express-validator');

// Runs any preceding validator chains and short-circuits with a 400 if any failed.
// Keeps response shape friendly: { message, errors: [{ field, message }] }
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map(e => ({
    field: e.path || e.param,
    message: e.msg,
  }));
  return res.status(400).json({ message: 'Validation failed', errors });
}

module.exports = { validate };
