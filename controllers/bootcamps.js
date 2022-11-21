// @desc		Get all bootcamps
// @route   GET /api/vi/bootcamps
// @access  Public

exports.getBootcamps = (req, res, next) => {
	res.status(200).send({ success: true, message: 'Show all bootcamps' })
}

// @desc		Get single bootcamps
// @route   GET /api/vi/bootcamps/:id
// @access  Public

exports.getBootcamp = (req, res, next) => {
	res.status(200).send({ success: true, message: `Get bootcamp ${req.params.id}` })
}

// @desc		Create new bootcamp
// @route   POST /api/vi/bootcamps
// @access  Private

exports.createBootcamp = (req, res, next) => {
	res.status(200).send({ success: true, message: 'Create new bootcamp' })
}

// @desc		Update bootcamp
// @route   PUT /api/vi/bootcamps/:id
// @access  Private

exports.updateBootcamp = (req, res, next) => {
	res.status(200).send({ success: true, message: `Bootcamp ${req.params.id} updated` })
}

// @desc		Delete bootcamp
// @route   DELETE /api/vi/bootcamps/:id
// @access  Private

exports.deleteBootcamp = (req, res, next) => {
	res.status(200).send({ success: true, message: 'Bootcamp deleted' })
}