const path = require('path')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc		Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query

	// Copy req.query
	const reqQuery = { ...req.query }

	// Fields to exclude
	const removeFields = ['select', 'sort']

	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach(param => delete reqQuery[param])

	// Create query string
	let queryStr = JSON.stringify(req.query)

	// Create operators ($gt, $gte, $lte, etc)
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

	// Finding resource
	query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

	// Select Fields
	if (req.query.select) {
		const fields = req.query.select.split(',') // Split into array everytime commas appeared
		query = query.select(fields)
	}

	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ')
		query = query.sort(sortBy)
	} else {
		query = query.sort('-createdAt') // Use '-' to sort by DESC
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1
	const limit = parseInt(req.query.limit, 10) || 25
	const startIndex = (page - 1) * limit
	const endIndex = page * limit
	const total = await Bootcamp.countDocuments()

	query = query.skip(startIndex).limit(limit)

	// Executing query
	const bootcamps = await query

	// Pagination result
	const pagination = {}

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit
		}
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit
		}
	}

	res
		.status(200)
		.json({
			success: true,
			count: bootcamps.length,
			pagination,
			data: bootcamps
		})
})

// @desc		Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id)

	if (!bootcamp) {
		return next(
			new errorResponse(`Error, can't find resource with id: ${req.params.id}`, 404)
		)
	}
	res.status(200).json({
		success: true,
		data: bootcamp
	})

})

// @desc		Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

	const bootcamp = await Bootcamp.create(req.body)

	res.status(201).json({
		success: true,
		data: bootcamp
	})

})

// @desc		Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	})

	if (!bootcamp) {
		return next(
			new errorResponse(`Error, can't find resource with id: ${req.params.id}`, 404)
		)
	}
	res.status(200).json({
		success: true,
		data: bootcamp
	})
})

// @desc		Delete bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id)

	if (!bootcamp) {
		return next(
			new errorResponse(`Error, can't find resource with id: ${req.params.id}`, 404)
		)
	}
	bootcamp.remove()

	res.status(200).json({
		success: true,
		data: {}
	})
})

// @desc		Get bootcamps within a radius
// @route   DELETE /api/vi/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode)
	const lat = loc[0].latitude
	const lng = loc[0].longitude

	// Calc radius using radians
	// Divide dist by radius of Earth
	// Earth radius = 3,963 mi / 6,378 km
	const radius = distance / 6378 //km
	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
	})

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps
	})
})

// @desc		Upload photo for bootcamp
// @route   PUT /api/vi/bootcamps/:id
// @access  Private
exports.uploadPhotoBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id)

	if (!bootcamp) {
		return next(
			new errorResponse(`Error, can't find resource with id: ${req.params.id}`, 404)
		)
	}

	if (!req.files) {
		return next(
			new errorResponse(`Please upload the correct file`, 400)
		)
	}

	const file = req.files.file

	// Make sure the image is a photo
	if (!file.mimetype.startsWith('image')) {
		return next(
			new errorResponse(`Please upload an image file`, 400)
		)
	}

	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new errorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
		)
	}

	// Create custom file name
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

	// Move file to public folder
	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
		if (err) {
			console.error(err)
			return next(new errorResponse(`Error while upload photo`, 500))
		}
		// Update the bootcamp with photo 
		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
		res.status(200).json({
			success: true,
			data: file.name
		})
	})
})