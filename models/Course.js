const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add course title"]
	},
	description: {
		type: String,
		required: [true, "Please add a description"]
	},
	weeks: {
		type: String,
		required: [true, "Please add a number of weeks"]
	},
	tuition: {
		type: Number,
		required: [true, "Please add a tuition"]
	},
	minimumSkill: {
		type: String,
		required: [true, "Please add a minimum skill"],
		enum: ['beginner', 'intermediate', 'advance']
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		defaulte: Date.now
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true
	}
})

module.exports = mongoose.mongoose.model('Course', CourseSchema)