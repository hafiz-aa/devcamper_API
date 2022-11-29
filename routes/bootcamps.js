const express = require('express')
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
	uploadPhotoBootcamp
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// Include other resource routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router()

const { protect, authorize } = require('../middleware/auth')
// Main routers
router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(protect, authorize('publisher', 'admin'), createBootcamp)
router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, authorize('publisher', 'admin'), updateBootcamp)
	.delete(protect, authorize('publisher', 'admin'), deleteBootcamp)
router
	.route('/radius/:zipcode/:distance')
	.get(getBootcampsInRadius)
// Re-route into other resource routers
router
	.use('/:bootcampId/courses',
		courseRouter)
router
	.use('/:bootcampId/reviews',
		reviewRouter)
// Photo for bootcamp route
router
	.route('/:id/photo')
	.put(protect, authorize('publisher', 'admin'), uploadPhotoBootcamp)
module.exports = router