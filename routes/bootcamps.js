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

const router = express.Router()

const { protect } = require('../middleware/auth')
// Main routers
router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(protect, createBootcamp)
router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, updateBootcamp)
	.delete(protect, deleteBootcamp)
router
	.route('/radius/:zipcode/:distance')
	.get(getBootcampsInRadius)
// Re-route into other resource routers
router
	.use('/:bootcampId/courses',
		courseRouter)
//
router
	.route('/:id/photo')
	.put(protect, uploadPhotoBootcamp)
module.exports = router