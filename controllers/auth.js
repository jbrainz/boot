const User = require('../models/User');
const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');

//@description      Register user
//@route            POST /api/v1/auth/register
//@access           Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, password, email, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  ///create token
  sendTokenResponse(user, 200, res);
});

//@description      Login to bootcamp area
//@route            POST /api/v1/auth/login
//@access           Public
exports.login = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  //Valide for valid user login
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide a valid email and password', 400)
    );
  }
  //check for user.
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  //Check if password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  ///create token
  sendTokenResponse(user, 200, res);
});

//Get token from model, create cookie and send response.
const sendTokenResponse = (user, statusCode, res) => {
  //Create Toekn
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};

//@description      Get current logged in user
//@route            GET /api/v1/auth/me
//@access           Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
