const path = require('path')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc		Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res
		.status(200)
		.json(res.advancedResults)
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
	// Add user to req, body
	req.body.user = req.user.id

	// Check for published bootcamp
	const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

	// If the user is not an admin, they can only add one Bootcamp
	if (publishedBootcamp && req.user.role !== 'admin') {
		return next(
			new errorResponse(`The user with ID: ${req.user.id} can only publish one bootcamp`, 400)
		)
	}

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
	let bootcamp = await Bootcamp.findById(req.params.id)

	if (!bootcamp) {
		return next(
			new errorResponse(`Error, can't find resource with id: ${req.params.id}`, 404)
		)
	}

	// Make sure the user is bootcamp owner
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new errorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401)
		)
	}

	bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	})

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

	// Make sure the user is bootcamp owner
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new errorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401)
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