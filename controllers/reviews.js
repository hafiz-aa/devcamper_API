const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

// @desc		Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public

exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({
			bootcamp: req.params.bootcampId
		})
		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews
		})
	} else {
		res.status(200).json(res.advancedResults)
	}
})

// @desc		Get a single review
// @route   GET /api/v1/reviews/:id
// @access  Public

exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description'
	})

	if (!review) {
		return next(
			new errorResponse(`No review found for id : ${req.params.id}`,
				404),
		)
	}
	return res.status(200).json({
		success: true,
		data: review
	})
})

// @desc		Add a review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Public

exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId
	req.body.user = req.user.id

	const bootcamp = await Bootcamp.findById(req.params.bootcampId)

	if (!bootcamp) {
		return next(
			new errorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
			404
		)
	}

	const review = await Review.create(req.body)

	return res.status(201).json({
		success: true,
		data: review
	})
})

// @desc		Update a single review
// @route   PUT /api/v1/reviews/:id
// @access  Public

exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id)

	if (!review) {
		return next(
			new errorResponse(`No review found for id : ${req.params.id}`,
				404
			),
		)
	}

	// Make sure review belongs to the user or user is an admin
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new errorResponse(`You are not authorized to update this review`,
				401
			),
		)
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	})

	review.save()

	res.status(200).json({
		success: true,
		data: review
	})
})

exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id)

	if (!review) {
		return next(
			new errorResponse(`No review found for id : ${req.params.id}`,
				404
			),
		)
	}

	// Make sure review belongs to the user or user is an admin
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new errorResponse(`You are not authorized to update this review`,
				401
			),
		)
	}

	await review.remove()

	review.save()

	res.status(200).json({
		success: true,
		data: {}
	})
})