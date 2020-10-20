const { json } = require('express');
const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../util/geocoder');

//@description      Get all bootcamps
//@route            Get /api/v1/bootcamps
//@access           Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  //Copy req querry
  const reqQuery = { ...req.query };

  //Fields to exclude from the param.
  const removeFields = ['select', 'sort', 'limit', 'page'];

  //Loop over remove fields and delete them.
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = Bootcamp.find(JSON.parse(queryStr));
  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //Pagination.
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Executing query.
  const bootcamps = await query;

  //Pagination Result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

//@description      Get single bootcamps
//@route            Get /api/v1/bootcamps/:id
//@access           Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with id of: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@description      Create  bootcamps
//@route            POST /api/v1/bootcamps
//@access           Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@description      Update  bootcamps
//@route            PUT /api/v1/bootcamps/:id
//@access.          Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with id of: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

//@description      Delete  bootcamps
//@route            DELETE /api/v1/bootcamps/:id
//@access            Private
exports.deleteBootcaomp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with id of: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: {},
  });
});

//@description      GET bootcamps within radius
//@route            GET /api/v1/bootcamps/radius/:zipcode/:distance(miles).
//@access            Private
exports.getBootCampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat && lng from geocoder.
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calc. Radius using radians
  //Divide Distance by radius of earth.
  //Earth Radius =  3,963 mi or 6,378 km

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  if (!bootcamps) {
    return next(
      new ErrorResponse(`Resource not found with id of: ${req.params}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
