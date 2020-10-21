const ErrorResponse = require('../util/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  err.message = err.message;
  //Log to conosle for dev.
  console.log(err.stack.red);

  if (err.name === 'CastError') {
    const message = `Resource not Found with id of: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose error
  if (err.code === 11000) {
    const message =
      'One or more fields are duplicates i.e already exisiting in the database!';
    error = new ErrorResponse(message, 400);
  }

  //Mongoose Validation errors.
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};
module.exports = errorHandler;
