const errorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {
	let error = { ...err }

	error.message = err.message
	// Log to console for dev
	console.log(err.stack.red)

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		const message = `Error, resource not found`
		error = new errorResponse(message, 404)
	}


	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error'
	})
}

module.exports = errorHandler